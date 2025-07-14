import argparse
import openai
import os

def run_codex(context_path, prompt_path, output_path):
    with open(context_path, 'r') as f:
        context = f.read()
    with open(prompt_path, 'r') as f:
        prompt = f.read()

    full_prompt = f"{context}\n\n---\n\n{prompt}"
    response = openai.ChatCompletion.create(
        model="gpt-4",  # or your preferred Codex model
        messages=[{"role": "user", "content": full_prompt}],
        temperature=0.3
    )

    filename = os.path.basename(prompt_path).replace('.txt', '.tsx')
    out_file = os.path.join(output_path, filename)

    with open(out_file, 'w') as f:
        f.write(response['choices'][0]['message']['content'])

    print(f"✅ Wrote output to {out_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--context", required=True)
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    run_codex(args.context, args.prompt, args.out)