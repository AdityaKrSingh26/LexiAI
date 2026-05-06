# LexiAI – AI-Powered PDF Assistant

LexiAI is an intelligent PDF assistant that lets you chat with your documents, organize them into collections, generate visual flowcharts, and take rich notes — all powered by Groq's Llama 3.3 70B model.

## Features

### AI & Chat
- **Streaming Chat** — Answers stream token-by-token via SSE. No waiting for full response.
- **Cross-Document Chat** — Select up to 5 PDFs and ask one question across all of them. AI synthesizes a combined answer and cites each source document inline.
- **Semantic Search** — PDFs are chunked (2000 chars, 200-char overlap) on upload. Questions are scored against chunks; top 3 sent as context — not naive full-document truncation.
- **AI Auto-Tagging** — Tags generated automatically on upload using document content (fire-and-forget, non-blocking).
- **Visual Flowcharts** — On-demand Mermaid.js diagram generation from document structure.
- **Smart Summaries** — On-demand AI summarization of any document.

### Document Management
- **PDF Upload** — Drag & drop with Cloudinary storage, text extraction, and pre-chunking on upload.
- **Collections** — Organize PDFs into color-coded collections. Navigate via `/dashboard/collection/:id`.
- **Advanced Search** — Filter by title, tags, collection, date range, and file size with sort controls.
- **Bulk Operations** — Delete, favorite, or remove multiple documents at once.
- **Document Sharing** — Share documents or collections with other users (read / write / admin permissions).
- **Favorites** — Star documents for quick access; count shown in dashboard analytics.
- **Chat History** — All conversations saved per document, resumable anytime.

### Notes
- **Rich Text Editor** — TipTap with bold, italic, H2/H3, bullet/ordered lists, and code blocks.
- **Auto-save** — Debounced 800 ms. No manual save needed.
- **Export** — Download notes as `.md` file.

### Dashboard & Analytics
- **Stats Overview** — Document count, total storage used, favorites count.
- **Grid / List View** — Toggle between card grid and compact list for documents and collections.
- **Tag Badges** — Document tags visible on cards for quick scanning.

### Security & Infrastructure
- JWT authentication + bcrypt password hashing
- Rate limiting (`express-rate-limit`), Helmet security headers
- Joi input validation on all API endpoints
- CORS allowlist via environment variable

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui (New York), Framer Motion |
| State | Zustand |
| Routing | React Router v7 |
| Rich Text | TipTap |
| Diagrams | Mermaid.js (lazy-loaded) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq API — Llama 3.3 70B (streaming + non-streaming) |
| File Storage | Cloudinary |
| Auth | JWT + bcrypt |

## Screenshots

<img width="1090" height="935" alt="image" src="https://github.com/user-attachments/assets/ca7a4b6b-a345-4df3-a426-688d1db27de2" />
<img width="1814" height="616" alt="image" src="https://github.com/user-attachments/assets/51d22f49-0e05-4f7e-9e44-c29f15651363" />
<img width="1916" height="947" alt="image" src="https://github.com/user-attachments/assets/8abeb417-26a5-4d9d-b4ea-bb063f8e8917" />
<img width="1904" height="950" alt="image" src="https://github.com/user-attachments/assets/e86ec7af-3d3d-43a4-b44a-a9b27146152f" />

## Installation

```sh
git clone https://github.com/AdityaKrSingh26/LexiAI.git
cd LexiAI
```

### Backend Setup

```sh
cd server
npm install
```

Create `server/.env`:
```
MONGODB_URL=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Getting a Groq API Key (free)

LexiAI uses [Groq](https://groq.com) — free tier, no credit card required.

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in with Google or GitHub
3. **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`) → paste as `GROQ_API_KEY`

Free tier: 6,000 requests/day on Llama 3.3 70B — sufficient for personal use.

```sh
npm start
```

### Frontend Setup

```sh
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Architecture

### Streaming Chat
```
Client fetch → POST /api/pdfs/:id/ask/stream
  → Express SSE headers
  → Groq { stream: true }
  → pipe delta tokens to client
  → save Chat record on [DONE]
  → res.end()
```

### Cross-Document RAG
```
pdfIds[] + question
  → fetch each PDF
  → getRelevantContext(topK: 2) per PDF
  → combine with "--- Source: Title ---" headers
  → single Groq call
  → save Chat per PDF
```

### Auto-Tag Flow
```
uploadPDF → PDF.create() → generateTags(text).then(update)
// Non-blocking — upload response returns immediately
```

### Semantic Search
```
Upload: split text → 2000-char chunks, 200-char overlap → store in MongoDB
Query:  score query against all chunks → pick top 3 → inject as context
```
