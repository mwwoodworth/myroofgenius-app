from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app

client = TestClient(app)

def test_health():
    resp = client.get('/api/health')
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
