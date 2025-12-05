# BlackLetter - The High-Stakes Legal Auditor

BlackLetter is an AI-powered legal compliance tool designed for high-stakes contract analysis. It uses a RAG (Retrieval-Augmented Generation) pipeline to audit PDF contracts against a strict checklist of risks.

## Features

-   **AI-Powered Analysis**: Uses Groq (Llama 3) and LangChain to analyze contracts.
-   **RAG Pipeline**: Ingests PDFs, chunks text, and retrieves relevant context using ChromaDB.
-   **Premium UI**: A "White-Shoe Firm" aesthetic with a realistic document reader and interactive risk dashboard.
-   **Risk Scoring**: Calculates a risk score (0-100) and highlights specific violations with explanations.

## Tech Stack

-   **Backend**: Python, FastAPI, LangChain, ChromaDB, Groq API.
-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide React.
-   **Containerization**: Docker, Docker Compose.

## Prerequisites

-   Docker & Docker Compose
-   Groq API Key

## Quick Start (Docker)

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd BlackLetter
    ```

2.  **Set up Environment Variables**:
    Create a `.env` file in the `backend` directory (or set it in your shell):
    ```bash
    GROQ_API_KEY=your_groq_api_key_here
    ```
    *Note: You can also pass this in `docker-compose.yml` or a root `.env` file.*

3.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application**:
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend API Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

## Manual Setup (Development)

### Backend

1.  Navigate to `backend`:
    ```bash
    cd backend
    ```
2.  Create virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run server:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
    ```

### Frontend

1.  Navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run dev server:
    ```bash
    npm run dev
    ```

## License

Proprietary & Confidential.
