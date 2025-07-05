import os
import importlib
from fastapi.testclient import TestClient
from unittest import mock
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

os.environ["PARTNER_API_KEY"] = "testkey"

# Reload module to pick up env var
main = importlib.reload(importlib.import_module("backend.main"))
client = TestClient(main.app)

class DummyClient:
    def table(self, name):
        assert name == "products"
        return self
    def select(self, *args, **kwargs):
        return self
    def eq(self, *args, **kwargs):
        return self
    def execute(self):
        return type("Res", (), {"data": [{"id": "p1"}]})

def test_partner_products_auth():
    resp = client.get("/api/partner/products?tenant=t1")
    assert resp.status_code == 401

def test_partner_products_success(monkeypatch):
    monkeypatch.setattr(main, "supabase_admin", DummyClient())
    resp = client.get(
        "/api/partner/products?tenant=t1",
        headers={"x-api-key": "testkey"}
    )
    assert resp.status_code == 200
    assert resp.json() == {"products": [{"id": "p1"}]}
