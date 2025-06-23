from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import importlib.util
from pathlib import Path
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


def test_checkout_returns_session_id(monkeypatch):
    main = load_app(monkeypatch)
    client = TestClient(main.app)

    class Session:
        id = "sess_123"
        url = "http://example.com"

    monkeypatch.setattr(stripe.checkout.Session, "create", lambda **kwargs: Session())

    response = client.post("/api/checkout", json={"price_id": "price_abc"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
