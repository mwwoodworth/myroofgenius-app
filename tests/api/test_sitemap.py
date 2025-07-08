from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.main import app

client = TestClient(app)

def test_robots():
    resp = client.get('/robots.txt')
    assert resp.status_code == 200
    assert 'Sitemap:' in resp.text

def test_sitemap():
    resp = client.get('/sitemap.xml')
    assert resp.status_code == 200
    assert '<urlset' in resp.text
