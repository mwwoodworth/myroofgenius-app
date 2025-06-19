# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## Local Development

### Frontend (Next.js)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.
3. For a production build run:
   ```bash
   npm run build
   ```
4. Start the compiled app:
   ```bash
   npm start
   ```

### Backend (FastAPI)
The backend lives in `backend/main.py`.
Run it locally with [Uvicorn](https://www.uvicorn.org/):
```bash
pip install -r backend/backend/requirements.txt
uvicorn backend.main:app --reload
```
This will launch the API at `http://localhost:8000`.
