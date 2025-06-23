from fastapi.testclient import TestClient
from pathlib import Path
import sys
from types import ModuleType
from unittest.mock import MagicMock


def load_app(monkeypatch):
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    import stripe_stub
    sys.modules["stripe"] = stripe_stub
    monkeypatch.setenv("SUPABASE_URL", "http://localhost")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "key")
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    package = ModuleType("python_backend")
    package.__path__ = [str(root / "python_backend")]
    sys.modules["python_backend"] = package
    module = ModuleType("python_backend.main")
    module.__package__ = "python_backend"
    sys.modules["python_backend.main"] = module
    path = root / "python_backend" / "main.py"
    code = path.read_text()
    exec(compile(code, str(path), "exec"), module.__dict__)
    return module


def test_roof_report_endpoint(monkeypatch):
    main = load_app(monkeypatch)
    client = TestClient(main.app)
    resp = client.get("/api/roof/report")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["damageScore"] == 0.0
    assert "lastInspection" in data


def test_roof_report_failure(monkeypatch):
    main = load_app(monkeypatch)
    roof = main.roof

    async def boom():
        raise RuntimeError("fail")

    monkeypatch.setattr(roof, "_build_report", boom)
    client = TestClient(main.app)
    resp = client.get("/api/roof/report")
    assert resp.status_code == 500
