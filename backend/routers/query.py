from fastapi import APIRouter, HTTPException

from models.schemas import Citation, QueryRequest, QueryResponse
from services.embedder import get_query_embedding
from services.llm import generate_answer
from services.vector_store import search_similar

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse, response_model_by_alias=True)
async def query_documents(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        query_embedding = get_query_embedding(request.question)
        similar_chunks = search_similar(query_embedding, top_k=request.top_k)

        if not similar_chunks:
            return QueryResponse(
                answer="No relevant documents found. Please upload documents before querying.",
                citations=[],
            )

        answer = generate_answer(request.question, similar_chunks)

        # Deduplicate citations by (doc, page), preserve score
        citations: list[Citation] = []
        seen: set[tuple] = set()
        for chunk in similar_chunks:
            key = (chunk["document_name"], chunk["page_number"])
            if key not in seen:
                preview = chunk["text"][:200] + "…" if len(chunk["text"]) > 200 else chunk["text"]
                citations.append(
                    Citation(
                        document_name=chunk["document_name"],
                        page_number=chunk["page_number"],
                        chunk_text=preview,
                        score=chunk.get("score", 0.0),
                    )
                )
                seen.add(key)

        return QueryResponse(answer=answer, citations=citations)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
