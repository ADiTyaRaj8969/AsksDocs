<div align="center">

<br />

# ASK Docs

### **Upload a document. Ask anything. Get cited, grounded answers.**

A privacy-first **Retrieval-Augmented Generation** application.
Your file never leaves your browser. Every answer is traceable to a page.

<br />

<a href="https://aditya-raj19-askdocs.hf.space/">
  <img src="https://img.shields.io/badge/Try_the_Live_Demo-aditya--raj19--askdocs.hf.space-8B004A?style=for-the-badge&logoColor=white" alt="Try the Live Demo" height="34" />
</a>

<br />
<br />

<p>
  <img src="https://img.shields.io/badge/Node-20-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Docker-multi--stage-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e" />
</p>

</div>

<br />

---

## The problem

Large language models confidently invent facts that aren't in your document — and they can't read your private files at all. A bare chat with GPT or Gemini can't tell you what page 14 of *your* report says, and if you paste a paragraph in, it might still mix in details from its training data.

## The solution

ASK Docs uses **Retrieval-Augmented Generation**. Your document is chunked, embedded into a vector space, and indexed under your user ID. When you ask a question, the *question* is embedded too — the top-K most semantically similar chunks are pulled back and given to Gemini as grounding context. The model is instructed to answer **only** from those chunks, citing the source page on every claim. If the answer isn't in your document, it says so.

> No hallucinations. Full source traceability. Your data never trains anyone's model.

<br />

---

## How it works

```mermaid
flowchart LR
  subgraph Browser["In your browser"]
    A[Upload<br/>PDF · DOCX · XLSX · Image]
    B[Extract text<br/>locally]
    A --> B
  end

  subgraph Server["Server"]
    C[Chunk<br/>500-word windows<br/>100-word overlap]
    D[Gemini Embeddings<br/>768-dim · batched 5x]
    E[(Per-user<br/>vector store)]
    B -- text chunks only --> C
    C --> D --> E
  end

  subgraph Query["When you ask"]
    F[Your question]
    G[Embed question]
    H[Cosine top-K]
    I[Gemini 2.5 Flash<br/>with retrieved context]
    F --> G --> H
    E --> H
    H --> I
    I --> J[Cited answer]
  end
```

<br />

---

## The pipelines

#### Upload pipeline

```mermaid
flowchart TD
  A([User selects file]) --> B{Format allowed?<br/>PDF · DOCX · XLSX · PNG · JPG}
  B -- no --> X[/HTTP 400 — rejected/]
  B -- yes --> C[Extract text<br/>in browser]
  C --> D{Less than<br/>100 chars extracted?}
  D -- yes, scanned --> E[Tesseract OCR<br/>browser-side]
  D -- no --> F
  E --> F[Sliding-window chunking<br/>500 words · 100 overlap]
  F --> G[Gemini embedding-001<br/>5 chunks in parallel]
  G --> H[Atomic store<br/>scoped by userId]
  H --> I([Return chunksCreated])

  style A fill:#8B004A,stroke:#8B004A,color:#fff
  style I fill:#10B981,stroke:#10B981,color:#fff
  style X fill:#EF4444,stroke:#EF4444,color:#fff
  style E fill:#F59E0B,stroke:#F59E0B,color:#fff
```

#### Query pipeline

```mermaid
flowchart TD
  A([User submits question]) --> B{Non-empty<br/>and ≤ 2000 chars?}
  B -- no --> X[/HTTP 400 — rejected/]
  B -- yes --> C[Embed query<br/>RETRIEVAL_QUERY task]
  C --> D[Cosine top-K<br/>scoped by userId · k clamped 1-20]
  D --> E{Any relevant<br/>chunks?}
  E -- no --> Y[/Empty-state answer/]
  E -- yes --> F[Build grounded prompt<br/>===BEGIN CONTEXT=== fenced]
  F --> G[Gemini 2.5 Flash<br/>60-second timeout]
  G --> H[Deduplicate citations<br/>by document + page]
  H --> I([Return answer + citations])

  style A fill:#8B004A,stroke:#8B004A,color:#fff
  style I fill:#10B981,stroke:#10B981,color:#fff
  style X fill:#EF4444,stroke:#EF4444,color:#fff
  style Y fill:#6B7280,stroke:#6B7280,color:#fff
```

<br />

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Built for accuracy

- **Inline citations** on every answer — filename + page number
- **Strict prompt fencing** prevents context injection
- Says *"I don't know"* instead of making things up
- **Cosine-similarity top-K** retrieval

</td>
<td width="50%" valign="top">

### Built for privacy

- Your file is **extracted in the browser** — never reaches the server
- **Per-user vector isolation** by Firebase UID
- **All chunks wiped on tab close** via sessionStorage signal
- Full CSP, JWT auth, zero cookies, **no CSRF surface**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Built for speed

- **Parallel embedding** — 5 chunks at a time
- **Hashed-asset** immutable caching
- **Lazy-loaded OCR** (only paid for if you upload an image)
- **Atomic re-uploads** — old data is kept until the new version succeeds

</td>
<td width="50%" valign="top">

### Built for real use

- Five file formats — **PDF, DOCX, XLSX, PNG, JPG**
- **Tesseract OCR fallback** for scanned documents
- **Chat export to styled PDF** with branded header & avatars
- **Mobile-responsive** slide-in sidebar overlay

</td>
</tr>
</table>

<br />

---

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Frontend** | React 18 · Vite · Tailwind | Code-split per route; `pdf.js`, `xlsx`, `tesseract.js` all lazy-loaded |
| **Auth** | Firebase Google OAuth | Server verifies the JWT against Google's x509 certs (cached 6 hrs) |
| **LLM** | Gemini 2.5 Flash | Fast · cheap · citation-friendly |
| **Embeddings** | `gemini-embedding-001` | 768-dim vectors, batched 5-parallel |
| **Vector store** | Hand-rolled JSON + cosine similarity | Zero deps; atomic `tmp + rename` writes |
| **Backend** | Node 20 + Express | Single container; serves both API and React build |
| **OCR** | tesseract.js | Browser-side — no cloud OCR cost |
| **Deploy** | Docker → Hugging Face Spaces | Also runs on Render, Fly, Railway |

A legacy **Python / FastAPI** backend lives in [`backend/`](backend/) using ChromaDB. It's kept as a reference but not maintained or deployed — all current work is on the Node stack.

<br />

---

## Quick start

You need a [Google Gemini API key](https://aistudio.google.com/) (free tier works) and a [Firebase project](https://console.firebase.google.com/) with Google sign-in enabled.

```bash
git clone https://github.com/ADiTyaRaj8969/AsksDocs.git
cd AsksDocs

# Backend
cd server
npm install
cp .env.example .env          # add GEMINI_API_KEY=...
npm run dev                   # API on :5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env          # add VITE_FIREBASE_* values
npm run dev                   # UI on :5173
```

Open <http://localhost:5173>, sign in, drop a PDF in the sidebar, ask away.

<br />

---

## Deploy

<details>
<summary><b>Hugging Face Spaces (one command)</b></summary>

<br />

The repo *is* the Space. One [`Dockerfile`](Dockerfile) builds the frontend and serves it from the same Node process on port 7860. The YAML frontmatter at the top of this README is what HF reads to provision the Space.

```bash
git remote add hf https://huggingface.co/spaces/<your-username>/<space-name>
git push hf main:main
```

Add `GEMINI_API_KEY` and your `VITE_FIREBASE_*` values as **Space secrets** in the HF settings.

</details>

<details>
<summary><b>Docker (anywhere)</b></summary>

<br />

```bash
docker build -t askdocs .
docker run -p 7860:7860 -e GEMINI_API_KEY=... askdocs
```

</details>

<details>
<summary><b>Render</b></summary>

<br />

A [`render.yaml`](render.yaml) is included for one-click deploys, with a persistent disk mounted at `/app/server/data` so vectors survive restarts.

</details>

<br />

---

## Configuration

| Variable | Side | Required | Default | Purpose |
|----------|------|----------|---------|---------|
| `GEMINI_API_KEY` | server | yes | — | LLM + embeddings credential |
| `PORT` | server | no | `5000` | API listen port (HF expects `7860`) |
| `DATA_DIR` | server | no | `server/vector_db` | Where `store.json` lives. Mount a persistent volume here. |
| `ALLOWED_ORIGINS` | server | no | — | Comma-separated extra CORS origins |
| `SPACE_HOST` | server | auto | — | Injected by HF Spaces — auto-allowed in CORS |
| `VITE_FIREBASE_*` | frontend | yes | — | From Firebase Console → Project settings → web app |

<br />

---

## Security model

This is genuinely the strongest part of the project. Worth reading if you plan to host it for real users.

| Threat | Defense |
|--------|---------|
| **User A reads User B's data** | Every vector-store op scopes by `req.user.uid`. No code path returns a chunk without a matching UID. |
| **Prompt injection from the document** | Retrieved context is fenced with `===BEGIN CONTEXT===` markers; the system prompt explicitly tells Gemini to ignore instructions found in context. |
| **Token replay / CSRF** | Server verifies the Firebase JWT against Google's x509 certs (cached 6 hrs). Bearer-only — no cookies — so CSRF is structurally impossible. |
| **Path traversal** | Document names sanitised (`/` and `\` stripped, 255-char cap). All file ops in `try / catch`. |
| **Resource exhaustion** | Per-IP rate limits (10 uploads · 30 queries · 60 doc ops per minute). 60s LLM timeout. 5K-chunk-per-doc and 25K-chunk-per-user caps. |
| **XSS / clickjacking** | Full CSP with `frame-ancestors` allowlisted to `self` + HF Spaces. `script-src 'self'`. No `unsafe-eval`. |
| **Data persistence after use** | Closing the tab clears a `sessionStorage` flag, triggering `DELETE /api/documents` to wipe all of your vectors server-side. |
| **Vulnerable dependencies** | `npm audit --omit=dev` reports **0 vulnerabilities** in both projects. |

<br />

---

## API reference

All endpoints require `Authorization: Bearer <firebase-jwt>` and are rate-limited per IP.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| `POST` | `/api/upload` | `{ documentName, chunks: [{ text, pageNumber }] }` | `{ message, documentName, chunksCreated }` |
| `POST` | `/api/query` | `{ question, top_k? }` *(clamped 1–20)* | `{ answer, citations: [{ documentName, pageNumber, chunkText, score }] }` |
| `GET`  | `/api/documents` | — | `{ documents: [{ name, chunks, size }] }` |
| `DELETE` | `/api/documents/:name` | — | `{ message }` |
| `DELETE` | `/api/documents` | — | Wipes all of your data (used for session reset) |
| `GET`  | `/health` | — | `{ status, version, timestamp }` *(public, no auth)* |

<br />

---

## Project structure

```
AsksDocs/
├── server/                  Node + Express API
│   ├── index.js             entrypoint · CSP · rate limits · static serve
│   ├── middleware/auth.js   Firebase JWT verification
│   ├── routes/              upload · query · documents
│   └── services/            embedder · llm · vectorStore
├── frontend/                React + Vite SPA
│   ├── src/components/      ChatInterface · FileUpload · DocumentList · HomePage
│   ├── src/contexts/        AuthContext
│   ├── src/lib/             firebase · chunker · extractor (with OCR fallback)
│   └── src/api/api.js       axios client with bearer token attached
├── docs/                    Architecture diagrams (referenced by this README)
├── backend/                 Legacy Python/FastAPI implementation (not deployed)
├── Dockerfile               Multi-stage: build frontend → run server
├── render.yaml              Render deploy config
└── README.md                ← you are here
```

<br />

---

## Known limitations

These are honest gaps, not hidden bugs.

- **No streaming responses** — Gemini's full answer arrives in one shot. Token-by-token streaming would be a nice future addition.
- **In-memory vector store** — `store.json` is loaded into memory at startup. Fine up to a few hundred thousand chunks; past that, swap in ChromaDB or pgvector.
- **Single-turn Q&A** — each question is answered independently. There's no "based on what you said earlier" follow-up support.
- **Free Gemini tier rate-limits** — if you see *"quota exceeded"*, you've hit the per-minute or per-day cap.
- **No automated tests** — manual smoke testing only. The biggest gap if you intend production use.

<br />

---

## License

[MIT](LICENSE) © 2026 Aditya Raj.

<br />

<div align="center">

**[Live demo](https://aditya-raj19-askdocs.hf.space/) · [Source on GitHub](https://github.com/ADiTyaRaj8969/AsksDocs) · [Report an issue](https://github.com/ADiTyaRaj8969/AsksDocs/issues)**

</div>
