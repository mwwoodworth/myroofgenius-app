import os
import json
import stripe
import logging
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger(__name__)


def _required_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        logger.error("Missing required environment variable: %s", var_name)
        raise RuntimeError(f"{var_name} environment variable is required")
    return value

stripe.api_key = _required_env("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = _required_env("STRIPE_WEBHOOK_SECRET")

SUPABASE_URL = _required_env("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = _required_env("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


async def handler(request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        logger.info(
            "Processing checkout.session.completed for session %s", session["id"]
        )
        try:
            supabase.table("orders").insert(
                {
                    "user_id": session.get("metadata", {}).get("user_id"),
                    "product_id": session.get("metadata", {}).get("product_id"),
                    "stripe_session_id": session["id"],
                    "amount": session.get("amount_total", 0) / 100,
                    "status": "paid",
                }
            ).execute()
        except Exception as e:
            # Log but still acknowledge to Stripe
            logger.error("Supabase insert error: %s", e)

    return {"statusCode": 200, "body": json.dumps({"status": "ok"})}
