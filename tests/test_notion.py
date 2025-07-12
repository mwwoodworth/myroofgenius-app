from codex.integrations.notion_adapter import (
    search_notion_pages,
    get_page_snippet,
    create_notion_page,
)


def test_functions_exist():
    assert callable(search_notion_pages)
    assert callable(get_page_snippet)
    assert callable(create_notion_page)
