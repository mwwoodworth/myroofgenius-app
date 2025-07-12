from typing import Any

from .integrations.notion_adapter import create_notion_page


def sync_task_result(result: str, parent_id: str, title: str = "BrainOps Task") -> Any:
    """Create a Notion page summarizing a task result."""
    return create_notion_page(title=title, content=result, parent_id=parent_id)
