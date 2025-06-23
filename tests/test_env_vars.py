from pathlib import Path
from types import ModuleType
from unittest.mock import MagicMock
import sys
import pytest

ROOT = Path(__file__).resolve().parents[1]


def import_backend(monkeypatch):
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    import stripe_stub
    sys.modules["stripe"] = stripe_stub
    monkeypatch.setattr("supabase.create_client", lambda url, key: MagicMock())
    package = ModuleType("python_backend")
    package.__path__ = [str(ROOT / "python_backend")]
    sys.modules["python_backend"] = package
    module = ModuleType("python_backend.main")
    module.__package__ = "python_backend"
    sys.modules["python_backend.main"] = module
    path = ROOT / "python_backend" / "main.py"
    code = path.read_text()
    exec(compile(code, str(path), "exec"), module.__dict__)
    return module


REQUIRED_VARS = {
    "STRIPE_SECRET_KEY": "sk",
    "STRIPE_WEBHOOK_SECRET": "wh",
    "SUPABASE_URL": "http://localhost",
    "SUPABASE_SERVICE_ROLE_KEY": "key",
    "CONVERTKIT_API_KEY": "ck",
}


@pytest.mark.parametrize("missing", list(REQUIRED_VARS.keys()))
def test_missing_env_var_raises(monkeypatch, missing):
    for k, v in REQUIRED_VARS.items():
        if k != missing:
            monkeypatch.setenv(k, v)
    monkeypatch.delenv(missing, raising=False)
    with pytest.raises(RuntimeError):
        import_backend(monkeypatch)


def test_backend_imports_with_all_vars(monkeypatch):
    for k, v in REQUIRED_VARS.items():
        monkeypatch.setenv(k, v)
    mod = import_backend(monkeypatch)
    assert hasattr(mod, "app")
