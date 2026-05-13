import uuid
from typing import List, Dict


def chunk_text(
    pages: List[Dict],
    chunk_size: int = 500,
    overlap: int = 100,
) -> List[Dict]:
    """
    Split page-level text into overlapping word-based chunks.

    Each chunk carries:
      - chunk_id   : unique UUID
      - text       : the chunk content
      - page_number: source page
      - document_name: source file name
    """
    chunks: List[Dict] = []

    for page in pages:
        words = page["text"].split()

        if not words:
            continue

        if len(words) <= chunk_size:
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "text": page["text"],
                "page_number": page["page_number"],
                "document_name": page["document_name"],
            })
        else:
            i = 0
            while i < len(words):
                window = words[i: i + chunk_size]
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "text": " ".join(window),
                    "page_number": page["page_number"],
                    "document_name": page["document_name"],
                })
                if i + chunk_size >= len(words):
                    break
                i += chunk_size - overlap  # slide with overlap

    return chunks
