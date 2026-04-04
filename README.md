# DemandSense

DemandSense is a full-stack demand intelligence platform with:

- A FastAPI backend for ingestion, forecasting, RAG context retrieval, report generation, and accuracy tracking.
- A React + Vite frontend with a cyber-themed dashboard, global exploration view, and an AI assistant panel.

This README documents the code as it currently exists in this repository.

## Project Structure

```text
demand sense/
	backend/
		main.py
		database.py
		models.py
		dummy_data.py
		requirements.txt
		.env
		routes/
			health.py
			upload.py
			predictions.py
			rag.py
			reports.py
			accuracy.py
			data.py
			chat.py
	frontend/
		package.json
		index.html
		src/
			App.jsx
			index.css
			components/
				Riogami.jsx
			pages/
				Login.jsx
				Dashboard.jsx
				UploadData.jsx
				Predictions.jsx
				RAGContext.jsx
				Reports.jsx
				Analytics.jsx
				AccuracyTracker.jsx
				Settings.jsx
	test_upload_data.csv
```

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy + SQLite
- Pandas + NumPy
- Prophet + ARIMA (statsmodels)
- Sentence Transformers + FAISS
- Optional LLM integrations: Anthropic / OpenAI
- ReportLab (PDF export)
- SSE streaming responses

### Frontend

- React 19 + Vite
- Framer Motion
- Recharts
- Lucide icons
- `react-globe.gl` + Three.js
- `@tsparticles/react` for animated login background

## Features

- CSV data upload with validation and deduplication
- Multi-horizon demand forecasting (`30/60/90` days)
- Prophet + ARIMA ensemble with fallback dummy model
- RAG context retrieval from NewsAPI + semantic ranking with FAISS
- LLM-powered streaming reports with fallback template report
- Accuracy tracking with MAE / MAPE and status labels
- Reports listing and PDF download
- Streaming chat endpoint powering the in-app Riogami assistant
- Demo-mode fallbacks in frontend for partial/offline backend situations

## Backend

## Runtime Behavior

On startup (`backend/main.py`):

- Initializes database tables.
- Seeds 2 years of deterministic dummy sales data if table is empty.
- Attempts to load `SentenceTransformer("all-MiniLM-L6-v2")` into app state.
- Initializes in-memory FAISS cache in `app.state.faiss_cache`.

## Database Schema

Defined in `backend/models.py`:

- `sales_data`: daily demand by `date`, `product`, `region`.
- `predictions`: stored forecast runs, intervals, decomposition, optional actuals and errors.
- `rag_contexts`: retrieved article sets and retrieval query metadata.
- `reports`: generated report content plus source context snapshots.
- `accuracy_records`: tracked prediction-vs-actual error metrics.

## API Endpoints

All routes are mounted under `/api`.

### Health

- `GET /api/health`
- Returns database, embedding-model/FAISS readiness, and LLM key availability.

### Data Options

- `GET /api/data/options`
- Returns available products/regions, total record count, and date range.

### Upload

- `POST /api/upload`
- Multipart form-data with `file` (CSV).
- Required columns: `date`, `product`, `region`, `demand`.
- Normalization:
	- lower-cases column names
	- parses date with `errors="coerce"`
	- drops null date/demand rows
	- drops duplicate `date+product+region`
	- sorts by date

### Predictions

- `POST /api/predict`
- Body:

```json
{
	"product": "Electronics",
	"region": "North America",
	"horizon": 30
}
```

- Pipeline:
	- Fetches historical records from DB.
	- Attempts Prophet forecast.
	- Attempts ARIMA with simple `(p,d,q)` grid search.
	- Uses weighted ensemble when both succeed (`70% Prophet + 30% ARIMA`).
	- Falls back to synthetic dummy forecast when models fail.
	- Computes heuristic confidence score from recent variability proxy.
	- Persists prediction record.

- Response contains `historical`, `predicted`, `confidence_score`, and decomposition arrays.

### RAG Context

- `POST /api/rag/context`
- Body:

```json
{
	"product": "Electronics",
	"region": "North America"
}
```

- Behavior:
	- If `NEWS_API_KEY` exists, fetches recent articles from NewsAPI.
	- If embedding model is loaded, ranks semantically with FAISS cosine/IP search.
	- Adds `relevance_score` values.
	- Falls back to deterministic dummy articles when external retrieval is unavailable.
	- Persists context record.

### Reports

- `POST /api/reports/generate`
- Streams report text as `text/event-stream`.
- Uses:
	- Anthropic streaming if `ANTHROPIC_API_KEY` is set,
	- else OpenAI streaming if `OPENAI_API_KEY` is set,
	- else dummy report streamed token-by-token.
- Saves generated content to `reports` table after streaming completes.

- `GET /api/reports`
	- Supports filters: `product`, `region`, `page`, `limit`
	- Returns report list and pagination metadata.

- `GET /api/reports/{report_id}/pdf`
	- Builds PDF via ReportLab and returns download response.

### Accuracy

- `POST /api/accuracy`
- Body:

```json
{
	"prediction_id": 12,
	"actual_demand": 1420
}
```

- Computes:
	- `avg_predicted` from stored predicted values,
	- `mae`, `mape`,
	- status: `Accurate` (`MAPE < 10`) / `Overestimated` / `Underestimated`.
- Updates prediction and inserts accuracy record.

- `GET /api/accuracy`
	- Returns all records + aggregate summary metrics.

### Chat

- `POST /api/chat`
- Streams assistant tokens as SSE.
- Uses Anthropic/OpenAI when keys exist; otherwise streams fallback text.

### Root

- `GET /`
- Returns API banner and docs location.

## Backend Setup

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure `backend/.env`:

```env
NEWS_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=sqlite:///./demandsense.db
```

Run backend server:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Frontend

## Navigation Model

The app uses a tab-based shell in `frontend/src/App.jsx` (not URL routing):

- `Global Intelligence` (`Dashboard.jsx`)
- `Data Ingestion` (`UploadData.jsx`)
- `Quantum Predict` (`Predictions.jsx`)
- `RAG Context` (`RAGContext.jsx`)
- `Neural Reports` (`Reports.jsx`)
- `Deep Analytics` (`Analytics.jsx`)
- `Model Accuracy` (`AccuracyTracker.jsx`)
- `Configuration` (`Settings.jsx`)

The login page (`Login.jsx`) supports two access modes:

- `real` mode
- `demo` mode

Both modes still call backend endpoints, but many pages include client-side dummy fallbacks when requests fail.

## Frontend Setup

From `frontend/`:

```powershell
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`

Build for production:

```powershell
npm run build
npm run preview
```

## End-to-End Run

1. Start backend on `8000`.
2. Start frontend on `5173`.
3. Open the app and sign in (real/demo).
4. Optionally upload `test_upload_data.csv` from repo root.
5. Run predictions and explore RAG, reports, and accuracy tabs.

## Sample Data File

`test_upload_data.csv` includes the required headers:

- `date`
- `product`
- `region`
- `demand`

You can upload this file immediately from the UI to validate ingestion.

## Environment Variables

Configured in `backend/.env`:

- `DATABASE_URL`: SQLAlchemy DB URL (default SQLite local file).
- `NEWS_API_KEY`: enables live news retrieval in RAG endpoint.
- `ANTHROPIC_API_KEY`: enables Claude-based report/chat generation.
- `OPENAI_API_KEY`: enables GPT-based report/chat generation.

If no API keys are configured, the app still works with deterministic fallbacks.

## Known Integration Gaps (Current Code)

These are implementation mismatches between some frontend expectations and backend contracts:

1. `frontend/src/pages/Dashboard.jsx` expects prediction shape using `historical[].ds` and `predicted[]` objects, but backend returns `historical[].date` plus `predicted.{dates,values,lower,upper}`.
2. `frontend/src/pages/Dashboard.jsx` calls `POST /api/report`, but backend exposes `POST /api/reports/generate`.
3. Dashboard reads `predictionData.summary.confidence_score`, while backend returns top-level `confidence_score`.
4. Several CSS variables/classes used by some pages (`--teal`, `--green`, `--red`, `--blue`, `--font-heading`, etc.) are referenced but not fully declared in `frontend/src/index.css`; visual consistency may vary.
5. `frontend/src/components/Sidebar.jsx` is route-based (`react-router-dom`) but not used by `App.jsx` (tab navigation is used instead).

These do not block app startup, but they can affect dashboard live-data behavior and UI styling fidelity.

## Operational Notes

- CORS is fully open (`allow_origins=["*"]`) in backend.
- SQLite uses `check_same_thread=False` for local concurrency compatibility.
- Heavy dependencies (`prophet`, `sentence-transformers`, `faiss-cpu`) increase first-time install/start time.
- App startup seeds data only when `sales_data` is empty.

## Troubleshooting

### Backend fails on model dependencies

- Ensure you are using a compatible Python version (3.10+ recommended).
- Install Microsoft C++ build tools if needed for scientific packages on Windows.

### `/api/health` shows FAISS/model not loaded

- The backend remains functional.
- RAG endpoint will fall back to dummy or non-semantic ranking behavior.

### No reports appear

- Use endpoints that actually generate reports (`/api/reports/generate`).
- `Reports` page loads from `/api/reports`, so generation must happen first.

### Prediction endpoint returns "No data found"

- Upload CSV rows for requested product/region.
- Or use existing seeded product/region combinations from `/api/data/options`.

## Development Notes

- Backend API entry: `backend/main.py`
- Backend route modules: `backend/routes/*.py`
- Frontend shell: `frontend/src/App.jsx`
- Primary UI pages: `frontend/src/pages/*.jsx`
- Global styles: `frontend/src/index.css`

## License

No license file is currently present in the repository.


## Recent Updates

- **2026-08-05**: docs: Add usage examples

- **2026-08-05**: docs: Add usage examples

- **2026-08-05**: docs: Add usage examples

- **2026-08-05**: feat: Add logging improvements

- **2026-08-05**: docs: Add usage examples

- **2026-08-05**: feat: Add logging improvements

- **2026-08-05**: docs: Add usage examples

- **2026-08-05**: feat: Add logging improvements

- **2026-05-14**: Update README

- **2026-05-16**: Update dependencies

- **2026-05-16**: Update dependencies

- **2026-06-01**: Improve UI/UX

- **2026-06-11**: Improve performance

- **2026-06-12**: Refactor code

- **2026-06-19**: Update dependencies

- **2026-06-20**: Improve performance

- **2026-07-03**: Improve performance

- **2026-07-11**: Update dependencies

- **2026-07-13**: Update documentation

- **2026-07-24**: Improve UI/UX

- **2026-07-27**: Update dependencies


## Commit Log

- [2026-04-10 02:27:44] Improve accessibility
- [2026-01-22 02:27:44] Update README
- [2026-05-23 02:27:44] Add unit tests
- [2026-06-23 02:27:44] Improve performance
- [2026-05-21 02:27:44] Improve error handling
- [2026-07-30 02:27:44] Fix bugs and issues
- [2026-03-25 02:27:44] Improve logging
- [2026-07-12 02:27:44] Add unit tests
- [2025-12-05 02:27:44] Enhance security
- [2025-11-06 02:27:44] Add API endpoints
- [2026-07-09 02:27:44] Refactor code structure
- [2026-04-13 02:27:44] Add validation
- [2025-11-27 02:27:44] Fix typos
- [2026-06-18 02:27:44] Update README
- [2025-12-01 02:27:44] Update configuration
- [2025-11-03 02:27:44] Improve accessibility
- [2026-04-22 02:27:44] Optimize queries
- [2026-07-25 02:27:44] Add unit tests
- [2025-09-09 02:27:44] Update documentation
- [2026-06-20 02:27:44] Add new features
- [2025-12-01 02:27:44] Update configuration
- [2026-04-10 02:27:44] Clean up code
- [2026-05-22 02:27:44] Improve error handling
- [2026-06-10 02:27:44] Improve error handling
- [2026-03-20 02:27:44] Optimize queries
- [2026-03-19 02:27:44] Add unit tests
- [2026-04-14 02:27:44] Improve accessibility
- [2025-12-14 02:27:44] Improve accessibility
- [2026-02-22 02:27:44] Improve logging
- [2025-10-27 02:27:44] Add new features
- [2026-05-12 02:27:44] Update documentation
- [2025-12-10 02:27:44] Enhance security
- [2026-03-21 02:27:44] Add comments
- [2026-03-24 02:27:44] Add comments
- [2026-01-04 02:27:44] Enhance security
- [2026-04-05 02:27:44] Improve error handling
- [2026-01-20 02:27:44] Add unit tests
- [2026-06-18 02:27:44] Add validation
- [2026-06-10 02:27:44] Update documentation
- [2025-10-10 02:27:44] Improve UI/UX
- [2026-01-02 02:27:44] Improve logging
- [2026-03-19 02:27:44] Update configuration
- [2025-08-14 02:27:44] Update dependencies
- [2026-04-17 02:27:44] Optimize queries
- [2025-11-08 02:27:44] Add new features
- [2025-08-20 02:27:44] Update README
- [2026-03-02 02:27:44] Optimize queries
- [2026-07-14 02:27:44] Improve performance
- [2025-12-27 02:27:44] Clean up code
- [2026-01-15 02:27:44] Optimize queries
- [2026-03-04 02:27:44] Improve UI/UX
- [2025-08-21 02:27:44] Optimize queries
- [2026-06-07 02:27:44] Update README
- [2025-12-10 02:27:44] Improve error handling
- [2026-06-18 02:27:44] Update documentation
- [2026-05-29 02:27:44] Optimize queries
- [2026-07-15 02:27:44] Fix bugs and issues
- [2026-04-09 02:27:44] Improve performance
- [2026-07-27 02:27:44] Fix bugs and issues
- [2025-11-17 02:27:44] Improve logging
- [2026-06-17 02:27:44] Improve performance
- [2025-11-08 02:27:44] Add unit tests
- [2025-11-21 02:27:44] Fix typos
- [2026-02-01 02:27:44] Update dependencies
- [2025-12-30 02:27:44] Enhance security
- [2025-08-21 02:27:44] Update documentation
- [2026-01-02 02:27:44] Refactor code structure
- [2026-05-07 02:27:44] Improve UI/UX
- [2026-07-16 02:27:44] Improve logging
- [2026-07-18 02:27:44] Optimize queries
- [2026-07-31 02:27:44] Improve performance
- [2025-08-18 02:27:44] Update documentation
- [2026-07-13 02:27:44] Clean up code
- [2026-05-19 02:27:44] Update configuration
- [2026-01-31 02:27:44] Fix typos
- [2025-10-17 02:27:44] Update configuration
- [2026-06-03 02:27:44] Improve error handling
- [2026-08-01 02:27:44] Improve performance
- [2025-10-18 02:27:44] Improve performance
- [2026-05-10 02:27:44] Update configuration
- [2026-04-19 02:27:44] Enhance security
- [2026-06-18 02:27:44] Update README
- [2026-01-31 02:27:44] Improve logging
- [2025-10-30 02:27:44] Add unit tests
- [2026-02-15 02:27:44] Add API endpoints
- [2025-12-05 02:27:44] Fix typos
- [2026-02-17 02:27:44] Add new features
- [2026-06-09 02:27:44] Improve logging
- [2026-08-03 02:27:44] Add new features
- [2026-05-20 02:27:44] Update README
- [2026-04-22 02:27:44] Clean up code
- [2026-01-09 02:27:44] Clean up code
- [2025-10-27 02:27:44] Update configuration
- [2025-11-30 02:27:44] Clean up code
- [2026-02-16 02:27:44] Improve accessibility
- [2025-08-07 02:27:44] Improve logging
- [2025-10-10 02:27:44] Add API endpoints
- [2025-09-04 02:27:44] Improve UI/UX
- [2025-09-16 02:27:44] Update configuration
- [2026-04-06 02:27:44] Update configuration
- [2025-11-22 02:27:44] Improve UI/UX
- [2025-12-03 02:27:44] Optimize queries
- [2026-02-21 02:27:44] Optimize queries
- [2026-04-18 02:27:44] Update documentation
- [2026-01-17 02:27:44] Add API endpoints
- [2025-12-21 02:27:44] Add comments
- [2025-08-12 02:27:44] Refactor code structure
- [2025-12-21 02:27:44] Improve logging
- [2025-11-07 02:27:44] Add unit tests
- [2026-01-27 02:27:44] Add API endpoints
- [2026-07-07 02:27:44] Improve UI/UX
- [2026-06-02 02:27:44] Add unit tests
- [2026-04-15 02:27:44] Add API endpoints
- [2025-11-16 02:27:44] Improve UI/UX
- [2026-02-21 02:27:44] Add new features
- [2026-04-05 02:27:44] Optimize queries