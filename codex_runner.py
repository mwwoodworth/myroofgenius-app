#!/usr/bin/env python3
"""
Run a single Codex/GPT prompt and write the generated code to the target folder.
Usage:
  python codex_runner.py \
      --context codex/REVISION_CONTEXT.md \
      --prompt  codex/prompts/hero_section.txt \
      --out     ./src/components/
"""

from __future__ import annotations
import argparse
import os
import pathlib
import re
import sys
from typing import List, Dict

try:
    from openai import OpenAI
except ImportError as exc:
    raise SystemExit("❌  openai‑python is missing. Run `pip install openai>=1.0.0`.") from exc

def _load_file(path: pathlib.Path) -> str:
    with path.open(encoding="utf‑8") as fh:
        return fh.read().strip()

def _detect_output_filename(prompt_text: str, default_stem: str) -> str:
    m = re.search(
        r"Output:\s*(?:.+?\s+for\s+)?[\"']?(?P<file>[^\"']+\.[a-zA-Z0-9]+)[\"']?",
        prompt_text,
        flags=re.IGNORECASE,
    )
    if m:
        return pathlib.Path(m.group("file")).name
    return f"{default_stem}.tsx"

def build_messages(context: str, prompt: str) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "You are a senior front‑end engineer who writes clean, modern, "
                "production‑ready React + TypeScript code."
            ),
        },
        {"role": "system", "content": context},
        {"role": "user", "content": prompt},
    ]

def run_codex(context_path: pathlib.Path, prompt_path: pathlib.Path, out_dir: pathlib.Path,
              model: str = "gpt-4o-mini", temperature: float = 0.3, max_tokens: int = 2048) -> None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        sys.exit("❌  OPENAI_API_KEY is missing in environment variables or GitHub Secrets.")

    client = OpenAI(api_key=api_key)

    context_text = _load_file(context_path)
    prompt_text = _load_file(prompt_path)

    print(f"🧠  Generating code for prompt: {prompt_path.name}")

    response = client.chat.completions.create(
        model=model,
        messages=build_messages(context_text, prompt_text),
        temperature=temperature,
        max_tokens=max_tokens,
    )

    generated = response.choices[0].message.content.strip()
    filename = _detect_output_filename(prompt_text, prompt_path.stem)
    out_path = out_dir / filename
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf‑8") as fh:
        fh.write(generated + "\n")

    print(f"✅  Wrote output → {out_path.relative_to(pathlib.Path.cwd())}")

def main() -> None:
    parser = argparse.ArgumentParser(description="Run a single Codex prompt.")
    parser.add_argument("--context", required=True, help="Markdown context file.")
    parser.add_argument("--prompt", required=True, help="Prompt .txt file.")
    parser.add_argument("--out", required=True, help="Destination directory.")
    parser.add_argument("--model", default=os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    parser.add_argument("--temperature", type=float, default=0.3)
    parser.add_argument("--max-tokens", type=int, default=2048)
    args = parser.parse_args()

    run_codex(
        pathlib.Path(args.context),
        pathlib.Path(args.prompt),
        pathlib.Path(args.out),
        model=args.model,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
    )

if __name__ == "__main__":
    main()
