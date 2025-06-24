from fastapi import FastAPI
from fastapi.testclient import TestClient
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    'roof', Path(__file__).resolve().parents[1] / 'routes' / 'roof.py'
)
roof_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(roof_module)

app = FastAPI()
app.include_router(roof_module.router)
client = TestClient(app)

def test_roof_report():
    response = client.get('/api/roof/report')
    assert response.status_code == 200
    assert response.json() == {'roof_id': 1, 'summary': 'Sample roof report'}
