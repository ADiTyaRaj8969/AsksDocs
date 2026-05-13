import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from google import genai

EMBEDDING_MODEL = "gemini-embedding-001"
_ENV_PATH = Path(__file__).parent.parent / ".env"


def _key() -> str:
    load_dotenv(dotenv_path=_ENV_PATH, override=True)
    return os.environ["GEMINI_API_KEY"]


def get_embedding(text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> List[float]:
    with genai.Client(api_key=_key()) as client:
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config={"task_type": task_type},
        )
    return result.embeddings[0].values


def get_query_embedding(text: str) -> List[float]:
    return get_embedding(text, task_type="RETRIEVAL_QUERY")


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    return [get_embedding(t) for t in texts]
