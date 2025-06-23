from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import importlib.util
from pathlib import Path
from types import ModuleType
import sys


def load_app(monkeypatch):
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    import stripe_stub as stripe
    sys.modules["stripe"] = stripe
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk")
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "wh")
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setenv("CONVERTKIT_API_KEY", "ck")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    package = ModuleType("python_backend")
    package.__path__ = [str(root / "python_backend")]
    sys.modules["python_backend"] = package
    path = root / "python_backend" / "main.py"
    spec = importlib.util.spec_from_file_location("python_backend.main", path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["python_backend.main"] = module
    spec.loader.exec_module(module)
    return module, stripe


def test_checkout_returns_session_id(monkeypatch):
    main, stripe = load_app(monkeypatch)
    client = TestClient(main.app)

    class Session:
        id = "sess_123"
        url = "http://example.com"

    monkeypatch.setattr(stripe.checkout.Session, "create", lambda **kwargs: Session())

    response = client.post("/api/checkout", json={"price_id": "price_abc"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data

