---
title: ASK Docs
emoji: 📄
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
---

# AskDocs — Intelligent Document Query System

![AskDocs Banner](https://img.shields.io/badge/AskDocs-Intelligent_Document_Assistant-6366f1?style=for-the-badge&logo=google-gemini&logoColor=white)

> **Privacy-First RAG-based IDP** · React · FastAPI · Express.js · ChromaDB · Google Gemini 2.5 Flash

---

## 📖 What is AskDocs?

AskDocs is a modern, privacy-first **Intelligent Document Processing (IDP)** system built on **Retrieval-Augmented Generation (RAG)** architecture. Traditional Large Language Models (LLMs) often suffer from "hallucinations" because they rely solely on their pre-trained generalized knowledge. AskDocs solves this by restricting the AI's knowledge base strictly to the documents you provide.

It allows users to upload various documents—PDFs, Word files, Excel spreadsheets, or even raw images—and ask natural-language questions about their content. The system then searches your specific documents, retrieves the most highly relevant text snippets, and passes *only* those snippets to **Google Gemini 2.5 Flash** to generate a concise, accurate answer complete with **inline source citations**.

**Privacy First**: Document parsing, text extraction, and vectorization happen entirely on your local server. Only the small, specific retrieved text chunks are sent to the Gemini API for the final answer generation, ensuring your entire document corpus remains private.

---

## ✨ Key Features in Depth

- **Multi-Format Ingestion**: Seamlessly supports and parses PDF, DOCX, XLSX/XLS, PNG, JPG, and JPEG files using specialized extraction libraries tailored to each format.
- **Advanced OCR Fallback**: If a user uploads a scanned PDF or a raw image without a selectable text layer, AskDocs intelligently falls back to OCR (Optical Character Recognition). Depending on the active backend, it utilizes the advanced multimodal capabilities of Gemini Vision or the robust `tesseract.js` engine to visually read and extract the text.
- **Smart Chunking Strategy**: Documents are not processed as single massive blocks. The system employs a sliding-window chunking algorithm (typically 500 words with a 100-word overlap). The overlap is critical: it prevents sentences or paragraphs from being cut in half across chunk boundaries, ensuring the semantic context is never lost during vector search.
- **Grounded Answers with Citations**: To guarantee accuracy, answers are exclusively generated from the uploaded documents. The system forces the LLM to explicitly cite the source document name and the exact page number (e.g., `*(Source: financial_report.pdf, Page 12)*`), making every claim fully verifiable.
- **Modern & Responsive UI**: A sleek React Single Page Application (SPA) built with Vite and Tailwind CSS. It features intuitive drag-and-drop file uploads, real-time visual progress tracking via Toast notifications, responsive mobile-friendly sidebars, and a beautiful dark-themed interface.
- **Dual Backend Architecture**: Built for both local experimentation and scalable cloud production. It features a high-performance Python backend (FastAPI + ChromaDB) for advanced local vector search, alongside a lightweight Node.js backend (Express.js + Local JSON DB) optimized for zero-dependency cloud deployments.

---

## 🛠️ Comprehensive Tech Stack

This project is built with maximum flexibility, offering two distinct backend implementations depending on your deployment needs.

### 1. Frontend Client
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS (Utility-first, Dark mode, fully responsive flexbox layouts)
- **File Handling**: React Dropzone (Client-side MIME type validation)
- **HTTP Client**: Axios
- **Markdown Rendering**: React Markdown + `remark-gfm` (For rendering rich text, bolding, lists, and tables returned by the LLM)

### 2. Python Backend (FastAPI)
*Ideal for high-performance local development, data science workflows, and advanced vector search.*
- **Core API**: FastAPI & Uvicorn (Asynchronous, lightning-fast routing)
- **AI Integration**: Official `google-genai` SDK
- **Models**: Gemini 2.5 Flash (LLM for text generation and OCR), `gemini-embedding-001` (for generating 768-dimensional embeddings)
- **Vector Database**: ChromaDB (Local persistent database utilizing HNSW indexing for rapid semantic similarity search)
- **Document Extractors**: 
  - `PyMuPDF` (High-fidelity PDF parsing)
  - `python-docx` (XML-based Word parsing)
  - `pandas` & `openpyxl` (Tabular Excel parsing)
  - `Pillow` (Image preprocessing)

### 3. Node.js Backend (Express.js)
*Used primarily for production deployment on Render and Hugging Face Spaces where C++ database bindings can be problematic.*
- **Core API**: Express.js & Multer (Stream-based file uploads)
- **AI Integration**: `@google/generative-ai` SDK
- **Vector Database**: Custom Persistent JSON Vector Store (Zero-dependency, mathematically calculates cosine similarity in-memory)
- **Document Extractors**: 
  - `pdf-parse` (Lightweight PDF reading)
  - `mammoth` (Word document to HTML/text conversion)
  - `exceljs` (Excel spreadsheet reading)
  - `tesseract.js` & `sharp` (Client/Server-side OCR & image compression)

### 4. Deployment & DevOps
- **Docker**: Containerized multi-stage builds (`Dockerfile`) to drastically reduce final image size.
- **Render Deployment**: Infrastructure-as-code configuration included (`render.yaml`) which provisions web services and a persistent disk volume (`/app/server/data`) to prevent vector data loss on server restart.
- **Hugging Face Spaces**: Optimized to run via a non-root user (uid 1000) on Port 7860 to comply with Hugging Face security protocols.

---

## 🏗️ Architecture Overview

**How RAG works in AskDocs:**
1. **The Ingestion Phase**: When a user drops a file, the Extractor service reads the raw text. The Chunker service breaks this massive text into smaller, overlapping 500-word windows. The Embedder service sends these chunks to the Gemini Embedding API, turning text into mathematical vectors. Finally, these vectors and their corresponding text are saved into the Vector Database (ChromaDB or JSON Store).
2. **The Querying Phase**: When a user asks a question, the exact same Embedding API turns the *question* into a vector. The Vector Database mathematically calculates the "Cosine Similarity" between the question vector and all document vectors, returning the top 5 closest matches. These 5 text chunks are injected into a strict prompt, and the Gemini LLM reads them to formulate a human-readable answer.

---

## 🚀 Installation & Quick Start

### Prerequisites
- **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))
- Python 3.10+ (If using Python Backend)
- Node.js 18.x+ (If using Node.js Backend / Frontend)

### Setup via Python Backend (Recommended for Local Dev)

For Windows users, we provide automated setup scripts:
1. Clone the repository and navigate into it.
2. Run `setup.bat` to create the virtual environment, install all dependencies, and scaffold the `.env` file.
3. Add your `GEMINI_API_KEY` to the newly created `backend/.env` file.
4. Run `start.bat` to boot up the backend API and frontend React server simultaneously.
5. Visit `http://localhost:5173`.

### Setup via Node.js Backend (Production Server)

1. Navigate to the server folder:
```bash
cd server
npm install
```
2. Create `.env` inside the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```
3. Start the server:
```bash
npm run dev
```

### Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at **[http://localhost:5173](http://localhost:5173)**.

---

## 🐳 Docker Deployment

To build and run the entire application (React Frontend + Node.js Backend) via Docker:

```bash
docker build -t askdocs .
docker run -p 7860:7860 -e GEMINI_API_KEY="your_api_key" askdocs
```

The application will be accessible at `http://localhost:7860`.

---

## 🧰 Utility Scripts

- **`generate_srs.py`**: A robust Python automation script designed to dynamically generate the project's Software Requirements Specification (SRS) document in `.docx` format, saving hours of manual documentation work for academic submissions.
- **`convert_viva.py`**: A specialized utility script used to process, extract, and format Q&A or viva-voce text data, likely used for preparing evaluation datasets or testing the LLM's accuracy against known academic questions.

---

## 📡 API Reference

Both backends adhere to the same REST endpoints:

| Method   | Endpoint                | Description                                         |
| :------- | :---------------------- | :-------------------------------------------------- |
| `POST`   | `/api/upload`           | Upload, extract, embed, and store a document.       |
| `POST`   | `/api/query`            | Ask a question and retrieve an answer + citations.  |
| `GET`    | `/api/documents`        | List all stored documents in the vector database.   |
| `DELETE` | `/api/documents/{name}` | Delete a document and purge its vectors.            |
| `GET`    | `/health`               | API Health check.                                   |

---

*Developed as part of the Advanced Web Technology (AWT) curriculum.*
