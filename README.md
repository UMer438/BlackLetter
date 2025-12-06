---
title: BlackLetter
emoji: ⚖️
colorFrom: gray
colorTo: gray
sdk: docker
app_port: 7860
---

# BlackLetter - The High-Stakes Legal Auditor

BlackLetter is an AI-powered legal compliance assistant designed to help you review contracts instantly. It acts as a "Junior Associate" that scans documents for risks and answers your questions.

## How It Works

1.  **Upload**: You upload a PDF contract. The system uses **LangChain** to split the text into chunks and stores them in a **ChromaDB** vector store.
2.  **Audit**: When you run an audit, the system retrieves relevant chunks for each item in the checklist and uses **Groq (Llama 3)** to analyze them for risks.
3.  **Chat**: You can ask free-form questions. The system retrieves the most relevant parts of the document to generate an accurate answer.

## Live Demo

The application is deployed and ready to use on Hugging Face Spaces:

👉 **[Launch BlackLetter](https://huggingface.co/spaces/Umer528/BlackLetter)**
