import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.fulfillment import FulfillmentService
from unittest.mock import Mock, patch

client = TestClient(app)

@pytest.fixture
def mock_fulfillment_service():
    with patch('backend.services.fulfillment.FulfillmentService') as mock:
        yield mock

def test_order_fulfillment_success(mock_fulfillment_service):
    # Mock successful fulfillment
    mock_service = Mock()
    mock_service.fulfill_order.return_value = {
        "order_id": "test-order-123",
        "download_links": [
            {
                "file_name": "test.pdf",
                "download_url": "https://example.com/download/abc123"
            }
        ],
        "email_sent": True
    }
    mock_fulfillment_service.return_value = mock_service
    
    # Test webhook endpoint
    webhook_data = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_123",
                "metadata": {
                    "product_id": "prod_123",
                    "user_id": "user_123"
                }
            }
        }
    }
    
    response = client.post(
        "/api/webhook",
        json=webhook_data,
        headers={"stripe-signature": "test_signature"}
    )
    
    assert response.status_code == 200
    assert mock_service.fulfill_order.called

def test_download_endpoint():
    # Test download token validation
    response = client.get("/api/download/invalid-token")
    assert response.status_code == 404
    
    # Test expired token
    response = client.get("/api/download/expired-token")
    assert response.status_code == 410
