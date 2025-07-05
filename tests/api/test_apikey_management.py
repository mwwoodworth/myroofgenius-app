import os
import importlib
from fastapi.testclient import TestClient
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

main = importlib.reload(importlib.import_module('backend.main'))
client = TestClient(main.app)

class DummyClient:
    def __init__(self):
        self.records = []
        self.filter_user = None
    def table(self, name):
        assert name == 'api_keys'
        return self
    def insert(self, record):
        self.records.append(record)
        return self
    def select(self, *args, **kwargs):
        return self
    def eq(self, column, value):
        self.filter_user = value
        return self
    def execute(self):
        if self.filter_user is not None:
            data = [r for r in self.records if r['user_id'] == self.filter_user]
        else:
            data = self.records
        return type('Res', (), {'data': data, 'error': None})

def test_create_key_requires_user():
    resp = client.post('/api/developer/apikeys')
    assert resp.status_code == 400

def test_create_key_success(monkeypatch):
    dummy = DummyClient()
    monkeypatch.setattr(main, 'supabase_admin', dummy)
    resp = client.post('/api/developer/apikeys', headers={'x-user-id': 'u1'})
    assert resp.status_code == 200
    assert 'api_key' in resp.json()
    assert dummy.records[0]['user_id'] == 'u1'

def test_list_keys(monkeypatch):
    dummy = DummyClient()
    dummy.records.append({'user_id': 'u1', 'key': 'k1'})
    monkeypatch.setattr(main, 'supabase_admin', dummy)
    resp = client.get('/api/developer/apikeys?user_id=u1')
    assert resp.status_code == 200
    assert resp.json()['keys'][0]['key'] == 'k1'
