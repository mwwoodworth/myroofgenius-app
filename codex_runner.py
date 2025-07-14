import argparse
import openai
import os
from dotenv import load_dotenv

def run_codex(context_path, prompt_path, output_path):
    load_dotenv()

    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")

    with open(context_path, 'r') as f:
        context = f.read()
    with open(prompt_path, 'r') as f:
        prompt = f.read()

    full_prompt = f"{context}\n\n---\n\n{prompt}"
    filename = os.path.basename(prompt_path).replace('.txt', '.tsx')
    out_file = os.path.join(output_path, filename)

    print(f"🧠 Running Codex on prompt: {os.path.basename(prompt_path)}")

    response = openai.ChatCompletion.create(
        model="gpt-4",  # or use "gpt-4-1106-preview" or preferred
        messages=[
            {"role": "system", "content": "You are a senior frontend engineer writing clean, modern, production-grade React + Tailwind code."},
            {"role": "user", "content": full_prompt}
        ],
        temperature=0.3
    )

    output = response['choices'][0]['message']['content']
    with open(out_file, 'w') as f:
        f.write(output)

    print(f"✅ Output written to {out_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--context", required=True)
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    run_codex(args.context, args.prompt, args.out)
