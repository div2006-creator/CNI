# AI-Powered Criminal Network Intelligence & Relationship Analysis System

An investigation-support platform designed to analyze synthetic structured and unstructured intelligence data, extract entities and relationships, build a criminal-network knowledge graph, detect suspicious patterns, and present explainable insights through an investigator dashboard.

> [!IMPORTANT]
> **INVESTIGATION SUPPORT SYSTEM NOTICE**:
> - This platform is designed solely for decision-support and intelligence relationship visualization. It does **not** declare guilt or automate criminal verdicts.
> - **100% Synthetic Data**: All demonstration data (persons, organizations, accounts, phones, locations) is completely anonymized and synthetic. No real personal identifiable information (PII) or real crime cases are included.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             Investigator UI                  │
                               │  (React 18 + Vite + Tailwind CSS + Cytoscape)│
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTP / REST APIs
                               ┌──────────────────────▼───────────────────────┐
                               │           FastAPI Backend API                │
                               │    (API Routers, Pydantic, Security, CORS)  │
                               └──────────┬───────────────────────┬───────────┘
                                          │                       │
               ┌──────────────────────────▼────────┐   ┌──────────▼──────────────────────────┐
               │    Graph Driver Abstraction       │   │    AI / NLP Service Abstraction      │
               │ ┌───────────────────────────────┐ │   │ ┌─────────────────────────────────┐ │
               │ │  MockInMemoryGraphDriver       │ │   │ │  BaseEntityExtractor            │ │
               │ ├───────────────────────────────┤ │   │ ├─────────────────────────────────┤ │
               │ │  Neo4jGraphDriver (Pluggable) │ │   │ │  BasePatternDetector            │ │
               │ └───────────────────────────────┘ │   │ └─────────────────────────────────┘ │
               └───────────────────────────────────┘   └─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript) + Vite
- **Styling**: Vanilla Tailwind CSS (Dark Intelligence Aesthetic System)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Network Graph Visualizer**: Cytoscape.js (`cytoscape`, `cytoscape-cose-bilkent`)
- **Routing**: React Router v6

### Backend
- **Framework**: Python 3.11+ with FastAPI
- **Data Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Server**: Uvicorn ASGI

### Data & AI Layer (Future-Ready Interfaces)
- **Data Manipulation**: pandas
- **Machine Learning**: scikit-learn
- **NLP Readiness**: spaCy / Transformers design interfaces

### Storage Architecture
- **Relational DB**: PostgreSQL (Configured via `.env`)
- **Graph DB**: Neo4j (Abstract driver ready for Cypher connection)

---

## 📂 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (health, entities, relationships, network, etc.)
│   │   ├── ai/              # NLP & pattern detection abstraction layers
│   │   ├── graph/           # Abstract graph driver, MockInMemory driver, Neo4j stub
│   │   ├── models/          # Domain data models
│   │   ├── schemas/         # Pydantic schemas (Node, Edge, Entity, Alert, Investigation)
│   │   ├── utils/           # Centralized logging & security helpers
│   │   ├── config.py        # Environment settings (Pydantic BaseSettings)
│   │   └── main.py          # FastAPI application entrypoint & CORS middleware
│   ├── data/
│   │   └── synthetic/       # Synthetic seed data generator ("Operation NorthStar")
│   ├── tests/               # pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI cards, badges, Cytoscape graph visualizer, header, sidebar
│   │   ├── pages/           # 8 Primary Views (Dashboard, Investigation, Network, Entities, etc.)
│   │   ├── services/        # REST API client with synthetic mock fallback
│   │   ├── mock/            # Isolated synthetic frontend mock datasets
│   │   ├── types/           # TypeScript data interfaces
│   │   ├── App.tsx          # Router setup
│   │   └── index.css        # Tailwind styles & dark mode design system
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                    # Architectural notes
├── .env.example             # Configuration settings template
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local `.env` configuration:

```bash
cp .env.example .env
```

Key environment configurations:
- `USE_MOCK_GRAPH`: Set to `True` for standalone testing; `False` to connect to Neo4j.
- `NEO4J_URI`: Bolt endpoint for Neo4j database (default: `bolt://localhost:7687`).
- `POSTGRES_HOST`: PostgreSQL hostname.
- `CORS_ORIGINS`: Allowed frontend origins (comma-separated).

---

## 🚀 Quick Setup Instructions

### 1. Starting the Backend API

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API interactive Swagger documentation will be available at:
👉 **`http://localhost:8000/docs`**

Verify system health endpoint:
👉 **`http://localhost:8000/api/health`**

---

### 2. Starting the Frontend UI

```bash
cd frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

### 3. Running Automated Tests & Production Build

```bash
# Test backend endpoints
cd backend
python -m pytest

# Build frontend production bundle
cd frontend
npm run build
```

---

## 🔮 Future AI/NLP & Neo4j Architecture Roadmap

### 1. NLP Entity Extraction Engine (`spaCy` / `Transformers`)
The `BaseEntityExtractor` interface (`backend/app/ai/extractor.py`) is structured to support fine-tuned Named Entity Recognition (NER) models:
- **Text Ingestion**: Unstructured surveillance field reports and wiretap transcriptions.
- **Model Pipeline**: spaCy `en_core_web_sm` / BERT fine-tuned models for domain entity labels (`PERSON`, `ORGANIZATION`, `ACCOUNT`).
- **Human-in-the-Loop**: Suggested entities are pushed to investigator review queue before graph insertion.

### 2. Neo4j Knowledge Graph Production Driver
The `AbstractGraphDriver` interface (`backend/app/graph/abstract.py`) allows toggling from `MockInMemoryGraphDriver` to `Neo4jGraphDriver` (`backend/app/graph/neo4j_driver.py`):
- **Cypher Query Optimization**: Native shortest-path computation (`gds.shortestPath`) and Community Detection algorithms (Louvain, PageRank).
- **Sub-second Scalability**: Scales to millions of nodes and edges under native Neo4j index structures.
