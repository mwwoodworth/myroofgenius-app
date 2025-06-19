from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import importlib.util
from pathlib import Path
import os
import stripe


def load_app(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    spec = importlib.util.spec_from_file_location(
        "backend_main", Path(__file__).resolve().parents[1] / "backend" / "main.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_checkout_session_completed_creates_order(monkeypatch):
    main = load_app(monkeypatch)
    client = TestClient(main.app)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "sess_123",
                "metadata": {"user_id": "u1", "product_id": "p1"},
                "amount_total": 5000,
            }
        },
    }

    def fake_construct_event(payload, sig, secret):
        return event

    monkeypatch.setattr(stripe.Webhook, "construct_event", fake_construct_event)

    supabase_mock = MagicMock()
    supabase_mock.table.return_value.insert.return_value.execute = MagicMock()
    monkeypatch.setattr(main, "supabase", supabase_mock)

    response = client.post("/api/webhook", data=b"{}", headers={"stripe-signature": "test"})
    assert response.status_code == 200
    supabase_mock.table.assert_called_with("orders")
    supabase_mock.table.return_value.insert.assert_called_once()
