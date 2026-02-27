<div align="center">
  <img src="./public/favicon.ico" alt="SubZero Logo" width="80" height="80">
  
  # SubZero
  **Melt your ghost subscriptions. Regain financial control.**

  *An autonomous AI agent that reads your receipts, graphs your burn rate, and hunts down subscriptions you forgot you were paying for.*

  ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black)
  ![Genkit](https://img.shields.io/badge/AI-Google%20Genkit%20%2B%20Gemini-4285F4?logo=google&logoColor=white)

  <br />
  
  ![SubZero Dashboard](./public/demo-placeholder.png)
  *(Placeholder: Insert high-res dashboard screenshot here)*
</div>

---

## ⚡ Core Features

*   **📥 Quick Sync (Gmail Integration):** Connect one or multiple Gmail accounts. SubZero scans for invoices and receipts instantly. No brittle bank connections required.
*   **🧠 AI Extraction:** Forget manual entry. Using Google Genkit and Gemini 1.5 Flash, SubZero reads messy email HTML and semantically extracts the service name, exact amount, and billing cycle.
*   **📈 Financial Pulse:** A beautiful 12-month predictive burn chart. Toggle the "Optimized Path" to see exactly how much you'd save by switching your monthly subs to annual plans.
*   **💬 "Ask SubZero" Chat:** A glassmorphic AI assistant living in your dashboard. Ask it *"How much am I spending on streaming?"* or *"What renews next week?"* for instant, precise answers based solely on your data.
*   **🤖 Shadow Sync:** Set it and forget it. A Vercel Cron job runs daily in the background, incrementally syncing your inboxes for new receipts so your ledger is never out of date.

---

## 🛠 The "Vibe Code" Stack

SubZero is built on a modern, edge-ready stack prioritizing speed, animations, and AI-native architecture.

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Radix UI, Recharts |
| **Backend & DB** | Firebase (Auth, Firestore), Firebase Admin SDK, Vercel Cron |
| **AI Engine** | Google Genkit, Gemini 1.5 Flash (via `@genkit-ai/google-genai`) |
| **Integrations** | Googleapis (Gmail API OAuth2), Nodemailer |

---

## 🔒 Security & Privacy First

We treat your inbox with the highest respect:
*   **Least Privilege:** SubZero requests the highly restricted `https://www.googleapis.com/auth/gmail.readonly` OAuth scope. It can read emails, but it cannot delete, send, or modify them.
*   **AES-256-GCM Encryption:** Google refresh tokens are strongly encrypted *before* hitting the Firestore database using `crypto` AES-256-GCM.
*   **Lean LLM Context:** When syncing or chatting, only the bare minimum text or subscription metadata is sent to Gemini. Your entire history is never dumped into a prompt.

---

## 🚀 Setup Guide

Get SubZero running locally in minutes.

### 1. Clone & Install
```bash
git clone https://github.com/KevinGeorge100/smart-subscription-manager.git
cd smart-subscription-manager
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory. You will need to provision projects in Firebase and Google Cloud Console.

```env
# Google Cloud Console (OAuth & API)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:9002/api/gmail/callback"
GEMINI_API_KEY="your_gemini_api_key_for_genkit"

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nVery\nLong\nKey\n-----END PRIVATE KEY-----\n"

# Security (Generate random 32-byte hex strings)
ENCRYPTION_KEY="your_32_byte_aes_key_in_hex"
CRON_SECRET="your_random_cron_secret"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) (Port 9002 is specified in `package.json`).

---

## 📚 Documentation
Looking for the academic summary and methodology? Read the **[Project Abstract](./docs/ABSTRACT.md)**.

*This project was developed adhering to S6 academic standards for software architecture and autonomous agent design.*
