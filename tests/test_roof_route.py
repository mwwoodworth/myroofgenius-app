from fastapi.testclient import TestClient
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.main import app

client = TestClient(app)

def test_get_roof_report():
    response = client.get("/api/roof/report")
    assert response.status_code == 200
    assert response.json() == {"report": "sample"}
