import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.main import app
from unittest.mock import patch

client = TestClient(app)

@pytest.fixture
def mock_fulfillment_service():
    class Dummy:
        def __init__(self):
            pass
        async def fulfill_order(self, session_id: str):
            return {
                "order_id": "test-order-123",
                "download_links": [
                    {
                        "file_name": "test.pdf",
                        "download_url": "https://example.com/download/abc123",
                    }
                ],
                "email_sent": True,
            }

    with patch('backend.main.FulfillmentService', Dummy):
        yield Dummy

def test_order_fulfillment_success(mock_fulfillment_service):
    # Dummy webhook payload
    webhook_data = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_123",
                "metadata": {
                    "product_id": "prod_123",
                    "user_id": "user_123",
                },
            }
        },
    }
    
    with patch('backend.main.stripe.Webhook.construct_event', return_value=webhook_data):
        response = client.post(
            "/api/webhook",
            json=webhook_data,
            headers={"stripe-signature": "test_signature"}
        )
    assert response.status_code == 200

def test_download_endpoint():
    # Test download token validation
    response = client.get("/api/download/invalid-token")
    assert response.status_code == 404
    
    # Test expired token
    response = client.get("/api/download/expired-token")
    assert response.status_code == 404
