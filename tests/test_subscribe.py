from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import importlib.util
from pathlib import Path

import pytest


def load_app(monkeypatch):
    monkeypatch.setenv("CONVERTKIT_API_KEY", "test-key")
    monkeypatch.setenv("CONVERTKIT_FORM_ID", "123")
    spec = importlib.util.spec_from_file_location(
        "backend_main", Path(__file__).resolve().parents[1] / "python-backend" / "main.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DummyAsyncClient:
    def __init__(self):
        self.post_called_with = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    async def post(self, url, json=None, timeout=10):
        self.post_called_with = (url, json)
        return MagicMock(status_code=200, text="OK")


def test_subscribe_success(monkeypatch):
    main = load_app(monkeypatch)
    dummy_client = DummyAsyncClient()
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda: dummy_client)
    client = TestClient(main.app)

    resp = client.post("/api/subscribe", json={"email": "user@example.com"})

    assert resp.status_code == 200
    assert resp.json()["status"] == "success"
    url, payload = dummy_client.post_called_with
    assert "forms/123/subscribe" in url
    assert payload["email"] == "user@example.com"
