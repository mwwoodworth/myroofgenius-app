from typing import List, Dict
from supabase import Client


def search_products(supabase: Client, query: str) -> List[Dict]:
    """Simple full-text search on the products table"""
    if not supabase:
        return []
    res = (
        supabase.table("products")
        .select("id,name,description")
        .ilike("name", f"%{query}%")
        .execute()
    )
    return res.data or []
