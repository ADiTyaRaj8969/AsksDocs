import os
from pathlib import Path
from typing import List, Dict

from dotenv import load_dotenv
from google import genai

LLM_MODEL = "gemini-2.5-flash"
_ENV_PATH = Path(__file__).parent.parent / ".env"


def _key() -> str:
    load_dotenv(dotenv_path=_ENV_PATH, override=True)
    return os.environ["GEMINI_API_KEY"]


def generate_answer(question: str, context_chunks: List[Dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(context_chunks, start=1):
        context_parts.append(
            f"[Source {i} — {chunk['document_name']}, Page {chunk['page_number']}]\n"
            f"{chunk['text']}"
        )
    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""You are an intelligent document assistant.
Answer the user's question using ONLY the context provided below.

CONTEXT:
{context}

QUESTION: {question}

RULES:
1. Base your answer solely on the context — do not use outside knowledge.
2. If the answer is not present in the context, respond with:
   "This information is not available in the uploaded documents."
3. Cite sources inline using the format: *(Source: filename, Page N)*
4. Format the response in clean Markdown (headers, bold, lists where appropriate).
5. Be concise and precise.

ANSWER:"""

    with genai.Client(api_key=_key()) as client:
        response = client.models.generate_content(model=LLM_MODEL, contents=prompt)
    return response.text
