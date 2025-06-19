from fastapi.testclient import TestClient
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / 'backend'))
from main import app

client = TestClient(app)

def test_subscribe_missing_email():
    resp = client.post('/api/subscribe', json={})
    assert resp.status_code == 400


def test_checkout_missing_price_id():
    resp = client.post('/api/checkout', json={})
    assert resp.status_code == 400


def test_webhook_bad_signature():
    resp = client.post('/api/webhook', data='{}', headers={'stripe-signature': 'bad'})
    assert resp.status_code == 400


def test_subscribe_success(monkeypatch):
    class MockResponse:
        status_code = 200
        text = 'ok'

    async def mock_post(*args, **kwargs):
        return MockResponse()

    monkeypatch.setattr('httpx.AsyncClient.post', mock_post)
    resp = client.post('/api/subscribe', json={'email': 'test@example.com'})
    assert resp.status_code == 200
    assert resp.json()['status'] == 'success'


def test_checkout_success(monkeypatch):
    class MockSession:
        id = 'sess'
        url = 'http://example.com'

    def mock_create(**kwargs):
        return MockSession()

    monkeypatch.setattr('stripe.checkout.Session.create', mock_create)
    resp = client.post('/api/checkout', json={'price_id': 'price'})
    assert resp.status_code == 200
    assert resp.json()['id'] == 'sess'


def test_webhook_success(monkeypatch):
    def mock_construct_event(payload, sig_header, secret):
        return {"type": "checkout.session.completed", "data": {"object": {"id": "s"}}}

    monkeypatch.setattr('stripe.Webhook.construct_event', mock_construct_event)
    resp = client.post('/api/webhook', data='{}', headers={'stripe-signature': 'sig'})
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ok'
