import os
import json
from typing import List, Dict, Any

import requests

NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def _get_secret(name: str) -> str:
    """Load a secret from the /secrets path or environment."""
    if name in os.environ:
        return os.environ[name]
    secret_path = f"/secrets/{name}"
    if os.path.exists(secret_path):
        with open(secret_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    raise RuntimeError(f"Missing secret: {name}")


def _headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def search_notion_pages(query: str) -> List[Dict[str, Any]]:
    """Search for Notion pages or databases matching a query."""
    token = _get_secret("NOTION_TOKEN")
    url = f"{NOTION_API_BASE}/search"
    payload = {"query": query}
    resp = requests.post(url, headers=_headers(token), json=payload, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return data.get("results", [])


def get_page_snippet(page_id: str, limit: int = 3) -> str:
    """Return a text snippet from a page (first few blocks)."""
    token = _get_secret("NOTION_TOKEN")
    url = f"{NOTION_API_BASE}/blocks/{page_id}/children"
    params = {"page_size": limit}
    resp = requests.get(url, headers=_headers(token), params=params, timeout=10)
    resp.raise_for_status()
    blocks = resp.json().get("results", [])
    texts = []
    for block in blocks:
        block_type = block.get("type")
        rich_text = block.get(block_type, {}).get("rich_text", [])
        text_parts = [t.get("plain_text", "") for t in rich_text]
        if text_parts:
            texts.append("".join(text_parts))
    return "\n".join(texts)


def create_notion_page(title: str, content: str, parent_id: str) -> Dict[str, Any]:
    """Create a new Notion page under the given parent."""
    token = _get_secret("NOTION_TOKEN")
    url = f"{NOTION_API_BASE}/pages"
    payload = {
        "parent": {"page_id": parent_id},
        "properties": {
            "title": [{"text": {"content": title}}],
        },
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"text": {"content": content}}
                    ]
                },
            }
        ],
    }
    resp = requests.post(url, headers=_headers(token), json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()
