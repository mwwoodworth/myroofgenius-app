from fastapi.testclient import TestClient
import importlib.util
from pathlib import Path
import sys
from unittest.mock import MagicMock


def load_app(monkeypatch):
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    spec = importlib.util.spec_from_file_location(
        "python_backend_main", root / "python-backend" / "main.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_roof_report_endpoint(monkeypatch):
    main = load_app(monkeypatch)
    client = TestClient(main.app)
    resp = client.get("/api/roof/report")
    assert resp.status_code == 200
    assert resp.json() == {"report": "All clear"}
