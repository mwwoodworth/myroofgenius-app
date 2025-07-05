import os
import importlib
from fastapi.testclient import TestClient
from unittest import mock

os.environ['NEXT_PUBLIC_SUPABASE_URL'] = 'http://localhost'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'key'

main = importlib.reload(importlib.import_module('backend.main'))
client = TestClient(main.app)


def test_search_missing_query():
    resp = client.post('/api/search', json={})
    assert resp.status_code == 400


def test_search_results(monkeypatch):
    monkeypatch.setattr(main, 'supabase_admin', mock.Mock())
    monkeypatch.setattr(main, 'search_products', lambda c, q: [{'id': '1', 'name': 'Test', 'description': 'd'}])
    resp = client.post('/api/search', json={'query': 'test'})
    assert resp.status_code == 200
    assert resp.json() == {'results': [{'id': '1', 'name': 'Test', 'description': 'd'}]}
