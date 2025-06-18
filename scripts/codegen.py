import argparse
import os
import sys
import openai


def main():
    parser = argparse.ArgumentParser(description="Run GPT-4o code generation")
    parser.add_argument("--prompt", required=True, help="Prompt text or path to prompt file")
    parser.add_argument("--out", help="Output file path; if omitted, prints to stdout")
    parser.add_argument("--model", default="gpt-4o", help="OpenAI model name (default gpt-4o)")
    args = parser.parse_args()

    prompt = args.prompt
    if os.path.exists(prompt):
        with open(prompt, "r", encoding="utf-8") as f:
            prompt = f.read()

    response = openai.ChatCompletion.create(
        model=args.model,
        messages=[{"role": "user", "content": prompt}],
    )
    result = response["choices"][0]["message"]["content"]

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(result)
    else:
        sys.stdout.write(result)

if __name__ == "__main__":
    import os
    main()
