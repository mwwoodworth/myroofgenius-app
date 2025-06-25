import os
from typing import Optional, List, Dict
from supabase import create_client, Client

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def _get_client() -> Client:
    if not _supabase:
        raise RuntimeError("Supabase not configured")
    return _supabase


def fetch_prompt(name: str, version: Optional[int] = None) -> str:
    """Fetch a prompt template from Supabase."""
    if not _supabase:
        from .prompts import get_prompt as fallback_get
        return fallback_get(name)

    query = _get_client().table("prompts").select("content").eq("name", name)
    if version is not None:
        query = query.eq("version", version)
    else:
        query = query.order("version", desc=True).limit(1)
    data = query.execute()
    if data.data:
        return data.data[0]["content"]
    return ""


def list_prompts() -> List[Dict]:
    if not _supabase:
        return []
    data = _get_client().table("prompts").select("name,version,content").execute()
    return data.data or []


def create_prompt(name: str, version: int, content: str) -> Dict:
    if not _supabase:
        raise RuntimeError("Supabase not configured")
    data = _get_client().table("prompts").insert({
        "name": name,
        "version": version,
        "content": content,
    }).execute()
    return data.data[0]


def update_prompt(name: str, version: int, content: str) -> Dict:
    if not _supabase:
        raise RuntimeError("Supabase not configured")
    data = (
        _get_client()
        .table("prompts")
        .update({"content": content})
        .eq("name", name)
        .eq("version", version)
        .execute()
    )
    return data.data[0] if data.data else {}


def delete_prompt(name: str, version: int) -> None:
    if not _supabase:
        raise RuntimeError("Supabase not configured")
    _get_client().table("prompts").delete().eq("name", name).eq("version", version).execute()
