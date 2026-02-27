# SubZero: Autonomous AI-Driven Subscription Management

**An S6 Academic Project Abstract**

## Objective
The modern digital consumer is increasingly burdened by "Subscription Fatigue"—a phenomenon characterized by the accumulation of forgotten, recurring charges (often termed "ghost subscriptions") across fragmented platforms. SubZero is designed as an Autonomous Subscription Management Agent that mitigates this fatigue through continuous, AI-driven automation. By serving as an intelligent financial ledger, SubZero empowers users to regain visibility and control over their recurring liabilities without requiring manual data entry or intrusive bank credential connections.

## Technical Novelty
SubZero diverges from traditional personal finance applications by leveraging a privacy-first, email-centric ingestion model. The technical foundation rests on three pillars:
1. **Next.js 15 (App Router):** Providing a fast, React 19-powered edge architecture with a seamless glassmorphic user interface.
2. **Google Genkit & Gemini 1.5 Flash:** Acting as the semantic reasoning engine. Instead of relying on brittle regex patterns or dedicated bank API aggregators (like Plaid), SubZero uses generative AI to understand the natural language context of invoices and receipts.
3. **Gmail API Integration:** Utilizing a least-privilege OAuth scope (`gmail.readonly`) to securely read financial footprints directly from the user's inbox, ensuring high fidelity of data with minimal user friction.

## Methodology: "Sync -> Parse -> Predict"
The core operational pipeline of the SubZero agent is defined by the "Sync -> Parse -> Predict" loop:

*   **Sync (Data Ingestion):** Utilizing the Gmail API, SubZero queries connected inboxes for emails matching high-probability financial labels (e.g., "receipt", "invoice", "payment confirmation").
*   **Parse (Semantic Extraction):** Raw, unstructured email payloads (HTML/Text) are passed to the Genkit flow. Gemini 1.5 Flash evaluates the context to determine if the charge represents a *recurring* subscription. If proven true (confidence threshold $\ge$ 0.65), the LLM is constrained by a strict Zod schema to output structured JSON containing the service name, amount, ISO-4217 currency code, billing cycle, and projected renewal date.
*   **Predict (Financial Modeling):** The structured data is persisted in Firebase (Firestore). SubZero then constructs a predictive ledger, visualizing both historic burn and future financial liabilities up to a 12-month horizon.

## Key Impact and Features
By automating the lifecycle of subscription discovery, SubZero delivers immediate financial clarity through several key mechanisms:

*   **Financial Pulse:** A dynamic, predictive chart that models the user's 12-month burn rate. Crucially, it calculates an "Optimized Path," demonstrating the exact annual savings achievable by transitioning monthly subscriptions to yearly billing cycles.
*   **Shadow Sync:** A Vercel Cron-driven background automation process. "Shadow Sync" executes daily, incrementally scanning connected inboxes for new receipts since the last timestamp, automatically keeping the ledger synchronized without user intervention.
*   **"Ask SubZero" Semantic AI:** An embedded, context-aware chatbot. Users can interact with their subscription graph conversationally (e.g., "Which software subscriptions are renewing next week?"), supported by real-time data injection into the LLM context window.

## Conclusion
SubZero represents a paradigm shift in personal subscription management. By combining the ubiquitous nature of email receipts with the analytical power of modern large language models, it provides a low-friction, highly accurate, and autonomous solution to the growing problem of digital subscription fatigue.
