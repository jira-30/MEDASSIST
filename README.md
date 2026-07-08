# MedAssist — Multimodal Clinical AI Assistant

MedAssist is an interactive RAG-based application that helps doctors quickly understand a patient's medical history. Doctors can upload prescriptions, lab reports, and clinical notes — as PDFs, scanned images, text files, or tables — and MedAssist analyzes the full set of documents to generate a patient summary, surface a preliminary diagnosis suggestion through an interactive chatbot, and let doctors schedule a video call appointment directly with the patient.

## What It Does

- **Multimodal document ingestion**: Upload prescriptions and reports as PDF, text, scanned image, or table formats
- **Automated patient summarization**: Parses and synthesizes multi-source clinical documents into a single, readable patient summary
- **AI diagnostic assistant**: An interactive chatbot answers questions about the patient's condition and surfaces a preliminary diagnosis based on retrieved context
- **Doctor-patient video consultation**: Doctors can initiate a video call appointment with the patient directly from the application

> ⚠️ **Disclaimer**: MedAssist is a portfolio/research project and is not a certified medical device. Diagnostic suggestions are intended to support, not replace, clinical judgment.

## How It Works

MedAssist follows a Retrieval-Augmented Generation (RAG) pipeline purpose-built for multimodal clinical data:

1. **Ingestion & OCR** — Prescriptions, scanned reports, and documents are parsed using OCR (Tesseract) and document parsers (pdfplumber, docx) to extract raw text from PDFs, images, and tables
2. **Preprocessing** — Extracted text is cleaned and normalized using Regex-based pattern extraction to standardize clinical notes and diagnostic descriptions
3. **Embedding** — Cleaned text is converted into dense semantic vectors using `SentenceTransformers (all-MiniLM-L6-v2)`
4. **Retrieval** — FAISS performs fast nearest-neighbor search over the embedded patient records to retrieve the most relevant context for a query
5. **Classification** — A Linear SVM (scikit-learn) classifies retrieved content to support diagnostic categorization
6. **Generation** — Retrieved context is passed to the chatbot layer to generate the patient summary and diagnostic response

## Results

Initial model evaluation on a small validation set:

- **Accuracy: 87.5%**
- Strong precision/recall (1.00) on several diagnostic classes; one underrepresented class currently scores 0, highlighting a target area for more training data going forward

*Note: this evaluation set is small (8 samples total). Expanding the labeled dataset is a next step to validate these results at scale.*

## Tech Stack

| Category | Tools |
|---|---|
| Language | Python |
| Data handling | Pandas, NumPy |
| Text preprocessing | Regex (re), PDF/Text/Document parsers (pdfplumber, docx), OCR (Tesseract) |
| Embeddings | SentenceTransformers (all-MiniLM-L6-v2), PyTorch |
| Retrieval | FAISS (Facebook AI Similarity Search) |
| Classification | Scikit-learn (Linear SVM) |
| Visualization | Matplotlib, Seaborn |
| Backend / Database | Supabase |
| Frontend | Vite, TypeScript, React, shadcn-ui, Tailwind CSS |

## Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd rag_med

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Architecture

*A full architecture diagram covering the ingestion, embedding, retrieval, and generation pipelines is in progress and will be added here.*

## Roadmap

- [ ] Expand labeled dataset for more robust classification evaluation
- [ ] Add architecture diagram
- [ ] Improve handling of underrepresented diagnostic classes
- [ ] Add authentication/role-based access for doctor vs. patient views
