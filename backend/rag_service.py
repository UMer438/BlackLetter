import os
import shutil
from typing import List, Dict, Any
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import tempfile

# Initialize Embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize Vector Store (Persistent)
PERSIST_DIRECTORY = "./chroma_db"
vector_store = Chroma(
    collection_name="legal_docs",
    embedding_function=embeddings,
    persist_directory=PERSIST_DIRECTORY
)

# Initialize LLM
llm = ChatGroq(
    temperature=0,
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

class RiskAssessment(BaseModel):
    risk_score: int = Field(description="Risk score from 0 to 100")
    red_flagged_clauses: List[Dict[str, str]] = Field(description="List of risky clauses with 'clause_text' and 'explanation'")

parser = JsonOutputParser(pydantic_object=RiskAssessment)

async def ingest_document(file: UploadFile) -> str:
    """
    Ingests a PDF file, chunks it, and stores it in the vector database.
    Returns the document ID (filename for now).
    """
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        tmp_path = tmp_file.name

    try:
        # Load PDF
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()

        # Chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(docs)
        print(f"DEBUG: Extracted {len(splits)} chunks from {file.filename}")
        if len(splits) > 0:
            print(f"DEBUG: First chunk content: {splits[0].page_content[:200]}...")

        # Add metadata (doc_id)
        doc_id = file.filename
        for split in splits:
            split.metadata["doc_id"] = doc_id

        # Add to Vector Store
        vector_store.add_documents(documents=splits)
        
        return doc_id

    finally:
        os.remove(tmp_path)

def analyze_document(doc_id: str, checklist: List[str]) -> Dict[str, Any]:
    """
    Analyzes the document against a checklist using RAG.
    """
    results = {
        "overall_risk_score": 0,
        "violations": []
    }
    
    total_risk = 0
    
    for item in checklist:
        # Retrieve relevant chunks
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3, "filter": {"doc_id": doc_id}}
        )
        relevant_docs = retriever.invoke(item)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        print(f"DEBUG: Analyzing '{item}' - Context length: {len(context)}")
        
        # Generate Analysis
        prompt = ChatPromptTemplate.from_template(
            """
            You are a ruthless Senior Legal Compliance Officer. 
            Analyze the provided context against the specific checklist item: "{checklist_item}".
            
            Context:
            {context}
            
            If the context contains a risky clause or violation regarding the checklist item, cite the exact text and explain why.
            If no risk is found, return a risk score of 0 and empty list.
            
            If no risk is found, return a risk score of 0 and empty list.
            
            Output ONLY the JSON object. Do not include any conversational text, markdown formatting, or explanations outside the JSON.
            
            JSON Structure:
            {{
                "risk_score": <int 0-100>,
                "red_flagged_clauses": [
                    {{
                        "clause_text": "<exact text from context>",
                        "explanation": "<why it is risky>"
                    }}
                ]
            }}
            """
        )
        
        chain = prompt | llm | parser
        
        try:
            response = chain.invoke({"checklist_item": item, "context": context})
            
            if response["risk_score"] > 0:
                total_risk += response["risk_score"]
                for clause in response["red_flagged_clauses"]:
                    results["violations"].append({
                        "checklist_item": item,
                        "risk_score": response["risk_score"],
                        "clause_text": clause["clause_text"],
                        "explanation": clause["explanation"]
                    })
            else:
                results["violations"].append({
                    "checklist_item": item,
                    "risk_score": 0,
                    "clause_text": "",
                    "explanation": "No violation detected."
                })
                    
        except Exception as e:
            print(f"Error analyzing item '{item}': {e}")
            results["violations"].append({
                "checklist_item": item,
                "risk_score": 0,
                "clause_text": "Error",
                "explanation": "Analysis failed. Please try again."
            })
            
    # Normalize overall risk score (simple average for now, capped at 100)
    if checklist:
        results["overall_risk_score"] = min(100, total_risk // len(checklist))
        
    return results

def chat_with_document(doc_id: str, question: str) -> str:
    """
    Answers a question about the document using RAG.
    """
    # Retrieve relevant chunks
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5, "filter": {"doc_id": doc_id}}
    )
    relevant_docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    # Generate Answer
    prompt = ChatPromptTemplate.from_template(
        """
        You are a helpful legal assistant. Answer the user's question based strictly on the provided context.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer:
        """
    )
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({"question": question, "context": context})
        return response.content
    except Exception as e:
        return f"Error generating answer: {str(e)}"
