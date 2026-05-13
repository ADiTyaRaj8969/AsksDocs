from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import List


class _CamelModel(BaseModel):
    """Base model that serialises to camelCase so the JS frontend can consume it directly."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class UploadResponse(_CamelModel):
    message: str
    document_name: str
    chunks_created: int


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5


class Citation(_CamelModel):
    document_name: str
    page_number: int
    chunk_text: str
    score: float = 0.0


class QueryResponse(_CamelModel):
    answer: str
    citations: List[Citation]


class DocumentInfo(_CamelModel):
    name: str
    chunks: int = 0
    size: int = 0


class DocumentListResponse(_CamelModel):
    documents: List[DocumentInfo]
