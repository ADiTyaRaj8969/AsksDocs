from typing import List, Dict
import chromadb

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "askdocs_collection"

# Module-level singletons — avoids creating a new client on every request
_client: chromadb.PersistentClient | None = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=CHROMA_PATH)
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def store_chunks(chunks: List[Dict], embeddings: List[List[float]]) -> None:
    collection = _get_collection()
    collection.add(
        ids=[c["chunk_id"] for c in chunks],
        embeddings=embeddings,
        documents=[c["text"] for c in chunks],
        metadatas=[
            {"document_name": c["document_name"], "page_number": c["page_number"]}
            for c in chunks
        ],
    )


def search_similar(query_embedding: List[float], top_k: int = 5) -> List[Dict]:
    collection = _get_collection()

    # Guard: ChromaDB raises if n_results > collection size
    count = collection.count()
    if count == 0:
        return []
    n = min(top_k, count)

    results = collection.query(query_embeddings=[query_embedding], n_results=n)

    chunks: List[Dict] = []
    if results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            distance = results["distances"][0][i] if results.get("distances") else 0.0
            chunks.append({
                "text": doc,
                "document_name": results["metadatas"][0][i]["document_name"],
                "page_number": results["metadatas"][0][i]["page_number"],
                "score": round(1.0 - distance, 4),  # cosine distance → similarity
            })
    return chunks


def delete_document_chunks(document_name: str) -> None:
    collection = _get_collection()
    results = collection.get(where={"document_name": document_name})
    if results["ids"]:
        collection.delete(ids=results["ids"])


def list_documents() -> List[Dict]:
    """Return basic stats for every stored document."""
    collection = _get_collection()
    results = collection.get()
    if not results["metadatas"]:
        return []

    counts: Dict[str, int] = {}
    for m in results["metadatas"]:
        name = m["document_name"]
        counts[name] = counts.get(name, 0) + 1

    return [{"name": name, "chunks": count, "size": 0} for name, count in counts.items()]
