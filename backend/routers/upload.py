import os
import re
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models.schemas import DocumentListResponse, DocumentInfo, UploadResponse
from services.embedder import get_embeddings_batch
from services.vector_store import delete_document_chunks, list_documents, store_chunks

router = APIRouter(tags=["documents"])

MAX_CHUNKS = 2000
MAX_CHUNK_TEXT_LEN = 8000


class ChunkInput(BaseModel):
    text: str
    page_number: int = 1


class UploadRequest(BaseModel):
    document_name: str
    chunks: List[ChunkInput]


@router.post("/upload", response_model=UploadResponse, response_model_by_alias=True)
async def upload_document(body: UploadRequest):
    """Accept pre-extracted text chunks from the browser and embed them."""
    if not body.document_name.strip():
        raise HTTPException(status_code=400, detail="document_name is required.")

    if not body.chunks:
        raise HTTPException(status_code=400, detail="chunks array must not be empty.")

    if len(body.chunks) > MAX_CHUNKS:
        raise HTTPException(status_code=400, detail=f"Too many chunks (max {MAX_CHUNKS}).")

    for i, c in enumerate(body.chunks):
        if not c.text.strip():
            raise HTTPException(status_code=400, detail=f"Chunk {i} has empty text.")
        if len(c.text) > MAX_CHUNK_TEXT_LEN:
            raise HTTPException(status_code=400, detail=f"Chunk {i} text too long.")
        if c.page_number < 1:
            raise HTTPException(status_code=400, detail=f"Chunk {i} has invalid page_number.")

    # Strip path separators to prevent any path traversal
    safe_name = re.sub(r'[/\\]', '_', body.document_name.strip())[:255]

    try:
        delete_document_chunks(safe_name)

        import uuid
        chunks = [
            {
                "chunk_id": str(uuid.uuid4()),
                "text": c.text,
                "page_number": c.page_number,
                "document_name": safe_name,
            }
            for c in body.chunks
        ]
        embeddings = get_embeddings_batch([c["text"] for c in chunks])
        store_chunks(chunks, embeddings)

        return UploadResponse(
            message="Document processed successfully.",
            document_name=safe_name,
            chunks_created=len(chunks),
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/documents", response_model=DocumentListResponse, response_model_by_alias=True)
async def get_documents():
    docs = list_documents()
    return DocumentListResponse(
        documents=[DocumentInfo(name=d["name"], chunks=d["chunks"], size=d["size"]) for d in docs]
    )


@router.delete("/documents/{document_name}")
async def delete_document(document_name: str):
    safe_name = re.sub(r'[/\\]', '_', document_name.strip())[:255]
    delete_document_chunks(safe_name)
    return {"message": f"Document '{safe_name}' deleted successfully."}
