import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import stripe
import httpx
from .routes import roof
import sys
import types

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger(__name__)


def _required_env(var_name: str) -> str:
    """Return environment variable or raise a RuntimeError if missing."""
    value = os.getenv(var_name)
    if not value:
        logger.error("Missing required environment variable: %s", var_name)
        raise RuntimeError(f"{var_name} environment variable is required")
    return value
try:
    from supabase import create_client
except ModuleNotFoundError:  # Allow tests without package
    supabase_module = types.ModuleType("supabase")
    sys.modules["supabase"] = supabase_module

    def create_client(*_, **__):
        raise RuntimeError("Supabase package not installed")

    supabase_module.create_client = create_client

app = FastAPI()

# Include roof routes
app.include_router(roof.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize Stripe
stripe.api_key = _required_env("STRIPE_SECRET_KEY")
stripe_webhook_secret = _required_env("STRIPE_WEBHOOK_SECRET")

SUPABASE_URL = _required_env("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = _required_env("SUPABASE_SERVICE_ROLE_KEY")
supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

CONVERTKIT_API_KEY = _required_env("CONVERTKIT_API_KEY")
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
            timeout=10,
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
    domain = data.get(
        "domain", os.getenv("CHECKOUT_DOMAIN", "https://myroofgenius.com")
    )
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
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        try:
            supabase_client.table("orders").insert(
                {
                    "user_id": session.get("metadata", {}).get("user_id"),
                    "product_id": session.get("metadata", {}).get("product_id"),
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", 0) / 100,
                    "status": "paid",
                }
            ).execute()
        except Exception as e:
            # Log but still acknowledge to Stripe to avoid retries
            logger.error("Supabase insert error: %s", e)
        logger.info("Payment succeeded for session %s", session["id"])

    return {"status": "ok"}
