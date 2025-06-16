import os, json
import httpx

CONVERTKIT_API_KEY = os.getenv("CONVERTKIT_API_KEY")
CONVERTKIT_FORM_ID = os.getenv("CONVERTKIT_FORM_ID", "64392d9bef")

async def handler(request):
    try:
        body = await request.json()
    except Exception:
        body = json.loads(request.body.decode())

    email = body.get("email") if isinstance(body, dict) else None
    if not email:
        return {"statusCode": 400, "body": json.dumps({"error": "Email required"})}

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.convertkit.com/v3/forms/{CONVERTKIT_FORM_ID}/subscribe",
            json={"api_key": CONVERTKIT_API_KEY, "email": email},
            timeout=10
        )

    if resp.status_code not in (200, 201):
        return {"statusCode": resp.status_code, "body": resp.text}

    return {"statusCode": 200, "body": json.dumps({"status": "success"})}
