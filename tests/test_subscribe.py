from starlette.testclient import TestClient
from unittest.mock import MagicMock
from pathlib import Path
from types import ModuleType
import sys

import httpx


def load_app(monkeypatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk")
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "wh")
    monkeypatch.setenv("CONVERTKIT_API_KEY", "key")
    monkeypatch.setenv("CONVERTKIT_FORM_ID", "form")
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    import stripe_stub
    sys.modules["stripe"] = stripe_stub
    path = Path(__file__).resolve().parents[1] / "python_backend" / "main.py"
    package = ModuleType("python_backend")
    package.__path__ = [str(path.parent)]
    sys.modules["python_backend"] = package
    module = ModuleType("python_backend.main")
    module.__package__ = "python_backend"
    sys.modules["python_backend.main"] = module
    code = path.read_text()
    exec(compile(code, str(path), "exec"), module.__dict__)
    return module


class DummyAsyncClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    async def post(self, url, json=None, timeout=None):
        self.url = url
        self.json = json
        self.timeout = timeout
        return MagicMock(status_code=200)


def test_subscribe_sends_request(monkeypatch):
    main = load_app(monkeypatch)
    dummy_client = DummyAsyncClient()
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda: dummy_client)

    client = TestClient(main.app)
    response = client.post("/api/subscribe", json={"email": "test@example.com"})

    assert response.status_code == 200
    assert dummy_client.url.endswith("/subscribe")
    assert dummy_client.json["email"] == "test@example.com"
    assert dummy_client.json["api_key"] == "key"
