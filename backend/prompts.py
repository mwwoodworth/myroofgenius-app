from typing import Dict

PROMPTS: Dict[str, str] = {
    "copilot_intro": "Hello from MyRoofGenius Copilot."
}

def get_prompt(name: str) -> str:
    return PROMPTS.get(name, "")
