import os
import json
import stripe
import logging

logger = logging.getLogger(__name__)


def _required_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        logger.error("Missing required environment variable: %s", var_name)
        raise RuntimeError(f"{var_name} environment variable is required")
    return value


stripe.api_key = _required_env("STRIPE_SECRET_KEY")


async def handler(request):
    try:
        body = await request.json()
    except Exception:
        body = json.loads(request.body.decode())

    price_id = body.get("price_id")
    product_id = body.get("product_id")
    user_id = body.get("user_id")

    if not price_id:
        return {"statusCode": 400, "body": json.dumps({"error": "price_id required"})}

    domain = body.get(
        "domain", os.getenv("CHECKOUT_DOMAIN", "https://myroofgenius.com")
    )

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            client_reference_id=user_id,
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={"product_id": product_id, "user_id": user_id},
            success_url=f"{domain}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{domain}/cancel",
            automatic_tax={"enabled": True},
        )
        return {
            "statusCode": 200,
            "body": json.dumps({"id": session.id, "url": session.url}),
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
