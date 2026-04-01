# ⚖️ CovenAI - AI-Powered Legal Documentation Assistant

CovenAI is an AI-powered web platform that simplifies the creation, review, and management of legal documents.  
It helps users generate accurate legal drafts, analyze and simplify complex clauses, and collaborate in real-time — all powered by **Gemini AI**.
[![Website](https://img.shields.io/badge/Website-Live-green)](https://coven-ai-1.vercel.app/)
---

## 🚀 Features

- **AI Document Generator**
  - User selects a document type (Rent Agreement, NDA, Affidavit, etc.)
  - Gemini AI generates a legally formatted draft automatically.

- **AI Review & Simplify**
  - Upload or paste text to get simplified, summarized, or legally corrected content.

- **AI Legal Assistant (Chatbot)**
  - Gemini-powered chatbot that answers user’s legal or document-related questions.

- **OCR Integration**
  - Extracts editable text from scanned or photographed legal documents.

- **Multi-language Support**
  - Simplifies or translates legal documents into Indian regional languages.

- **Document Storage & Management**
  - Save, manage, and track all created or edited documents in Firebase.

- **Real-time Collaboration**
  - Edit documents with team members simultaneously using Firestore’s real-time sync.

- **User Dashboard**
  - View created documents, AI insights, and personalized recommendations.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React + Next.js + TailwindCSS + ShadCN UI | Modern responsive UI |
| **Backend** | Node.js + Express | API handling & Gemini AI communication |
| **AI Integration** | Google Gemini API | Document generation, simplification, chatbot |
| **Database** | Firebase Firestore | Document storage & metadata |
| **Auth & Hosting** | Firebase Authentication & Hosting | Secure user management |
| **Storage** | Firebase Storage | Upload & manage OCR files |
| **OCR** | Google Cloud Vision API / Tesseract.js | Extract text from images |
| **PDF Export** | jsPDF / pdf-lib | Export final documents |
| **Collaboration** | Firestore Realtime Sync | Live shared document editing |

---

## 📂 Pages Overview

| Page | Description |
|------|--------------|
| **Home** | Intro, features, call to action |
| **Login / Signup** | Firebase authentication |
| **Dashboard** | User’s document library, analytics, shortcuts |
| **Document Creator** | AI-based text editor to create/edit documents |
| **AI Review Page** | Upload text for review or simplification |
| **OCR Upload Page** | Scan and convert physical documents |
| **AI Legal Assistant** | Gemini chatbot for legal queries |
| **Profile / Settings** | Manage preferences, language, account |


---


---

## 🧠 How It Works

1. **User logs in** → navigates to Dashboard.
2. **Chooses document type** → Gemini AI generates draft.
3. **Edits in text editor** or uses **AI review** for improvements.
4. **Uploads scanned docs** via **OCR integration** (optional).
5. **Collaborates** with others or exports final PDF.
6. **Saves document** securely to Firebase.

---

## 🧰 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your-username/covenai.git
cd covenai

# 2️⃣ Install dependencies
npm install

# 3️⃣ Run the project
npm run dev


