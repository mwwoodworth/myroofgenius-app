import os, json, stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

async def handler(request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # TODO: handle order fulfillment, DB, email, etc.
        print("Payment succeeded:", session.get("id"))

    return {"statusCode": 200, "body": json.dumps({"status": "ok"})}
