import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_service import ingest_document, analyze_document, chat_with_document

app = FastAPI(title="BlackLetter API", description="The High-Stakes Legal Auditor API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Static Files (Frontend)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if static directory exists (Production)
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")
    
    @app.get("/")
    async def read_index():
        return FileResponse("/app/static/index.html")

    # Catch-all for SPA routing
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        if request.url.path.startswith("/api"):
            return {"detail": "Not Found"}
        return FileResponse("/app/static/index.html")

class AuditRequest(BaseModel):
    doc_id: str
    checklist: List[str] = [
        "Does this contract allow for unlimited liability?",
        "Is there a hidden arbitration clause?",
        "Does this violate GDPR data retention rules?",
        "Is there a termination for convenience clause?",
        "Are there any indemnification obligations?"
    ]

class ChatRequest(BaseModel):
    doc_id: str
    question: str

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads a PDF file and processes it for RAG.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        doc_id = await ingest_document(file)
        return {"doc_id": doc_id, "message": "Document processed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/audit")
async def audit_document(request: AuditRequest):
    """
    Audits a document against a checklist.
    """
    try:
        report = analyze_document(request.doc_id, request.checklist)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    doc_id: str
    question: str

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Answers a question about the document.
    """
    try:
        answer = chat_with_document(request.doc_id, request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
