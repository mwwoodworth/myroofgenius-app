import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import stripe
import httpx
import sentry_sdk
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from .prompt_service import (
    fetch_prompt,
    list_prompts,
    create_prompt,
    update_prompt,
    delete_prompt,
)
from .services.fulfillment import FulfillmentService
from .services.search import search_products

sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))

MAINTENANCE_MODE = os.getenv("MAINTENANCE_MODE") == "true"
MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL")
PARTNER_API_KEY = os.getenv("PARTNER_API_KEY")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_admin: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def maintenance_and_errors(request: Request, call_next):
    if MAINTENANCE_MODE and request.url.path != "/api/health":
        return JSONResponse({"detail": "maintenance"}, status_code=503)
    try:
        return await call_next(request)
    except Exception as exc:
        sentry_sdk.capture_exception(exc)
        if MAKE_WEBHOOK_URL:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(MAKE_WEBHOOK_URL, json={"error": str(exc)})
            except Exception:
                pass
        raise

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

CONVERTKIT_API_KEY = os.getenv("CONVERTKIT_API_KEY")
CONVERTKIT_FORM_ID = os.getenv("CONVERTKIT_FORM_ID", "64392d9bef")

@app.post("/api/subscribe")
async def subscribe(request: Request):
    data = await request.json()
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.convertkit.com/v3/forms/{CONVERTKIT_FORM_ID}/subscribe",
            json={"api_key": CONVERTKIT_API_KEY, "email": email},
            timeout=10
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return {"status": "success"}

@app.post("/api/checkout")
async def checkout(request: Request):
    data = await request.json()
    price_id = data.get("price_id")
    if not price_id:
        raise HTTPException(status_code=400, detail="price_id required")
    domain = data.get("domain", os.getenv("NEXT_PUBLIC_SITE_URL", "https://myroofgenius.com"))
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{domain}/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{domain}/cancel",
        automatic_tax={"enabled": True},
    )
    return {"id": session.id, "url": session.url}

@app.post("/api/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, stripe_webhook_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        try:
            fulfillment = FulfillmentService()
            order_res = fulfillment.supabase.table("orders").select("*").eq("stripe_session_id", session["id"]).execute()
            if order_res.data:
                order = order_res.data[0]
                if order.get("status") != "completed":
                    await fulfillment.fulfill_order(session["id"])
            else:
                new_order = {
                    "stripe_session_id": session["id"],
                    "product_id": None,
                    "user_id": None,
                    "customer_email": session.get("customer_details", {}).get("email"),
                    "amount": (session.get("amount_total", 0) or 0) / 100.0,
                    "status": "pending"
                }
                try:
                    line_items = stripe.checkout.Session.list_line_items(session["id"], limit=1)
                    if line_items.data:
                        price = line_items.data[0].price.id
                        prod_res = fulfillment.supabase.table("products").select("id").eq("price_id", price).execute()
                        if prod_res.data:
                            new_order["product_id"] = prod_res.data[0]["id"]
                except Exception as e:
                    print("Failed to retrieve line item for session", session["id"], ":", e)
                order_insert = fulfillment.supabase.table("orders").insert(new_order).execute()
                if not order_insert.error:
                    await fulfillment.fulfill_order(session["id"])
        except Exception as e:
            print("Error in fulfillment:", e)

    elif event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        sub = event["data"]["object"]
        print(f"Subscription event ({event['type']}) for customer {sub.get('customer')}")

    return {"status": "ok"}


@app.get("/api/prompts")
async def list_prompts_endpoint():
    """List all available prompts."""
    return {"prompts": list_prompts()}


@app.post("/api/prompts")
async def create_prompt_endpoint(data: dict):
    name = data.get("name")
    version = data.get("version")
    content = data.get("content")
    if not all([name, version, content]):
        raise HTTPException(status_code=400, detail="name, version, content required")
    return create_prompt(name, int(version), content)


@app.get("/api/prompts/{name}")
async def get_prompt_endpoint(name: str, version: int | None = None):
    return {"prompt": fetch_prompt(name, version)}


@app.put("/api/prompts/{name}/{version}")
async def update_prompt_endpoint(name: str, version: int, data: dict):
    content = data.get("content")
    if not content:
        raise HTTPException(status_code=400, detail="content required")
    return update_prompt(name, version, content)


@app.delete("/api/prompts/{name}/{version}")
async def delete_prompt_endpoint(name: str, version: int):
    delete_prompt(name, version)
    return {"status": "deleted"}


# Legacy endpoint
@app.get("/api/prompt/{name}")
async def legacy_get_prompt(name: str):
    return {"prompt": fetch_prompt(name)}


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/api/partner/products")
async def partner_products(request: Request, tenant: str):
    """Public partner API to fetch tenant scoped products."""
    if request.headers.get("x-api-key") != PARTNER_API_KEY:
        raise HTTPException(status_code=401, detail="unauthorized")
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="supabase not configured")
    data = (
        supabase_admin
        .table("products")
        .select("*")
        .eq("tenant_id", tenant)
        .eq("is_active", True)
        .execute()
    )
    return {"products": data.data or []}


@app.post("/api/search")
async def universal_search(data: dict):
    """Basic search across products"""
    query = data.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="query required")
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="supabase not configured")
    results = search_products(supabase_admin, query)
    return {"results": results}
