from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import importlib.util
from pathlib import Path
import httpx


def load_app(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setenv("CONVERTKIT_API_KEY", "ckey")
    monkeypatch.setenv("CONVERTKIT_FORM_ID", "form1")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    spec = importlib.util.spec_from_file_location(
        "backend_main", Path(__file__).resolve().parents[1] / "backend" / "main.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DummyAsyncClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    async def post(self, url, json=None, timeout=None):
        response = MagicMock()
        response.status_code = 200
        response.text = ""
        return response


def test_subscribe_success(monkeypatch):
    monkeypatch.setattr(httpx, "AsyncClient", DummyAsyncClient)
    main = load_app(monkeypatch)
    client = TestClient(main.app)

    response = client.post("/api/subscribe", json={"email": "test@example.com"})
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
