# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## Local Development

### Frontend (Create React App)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (react-scripts):
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.
3. Create a production build:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

### Backend (FastAPI)
The backend lives in `backend/main.py`.
Run it locally with [Uvicorn](https://www.uvicorn.org/):
```bash
pip install -r backend/backend/requirements.txt
uvicorn backend.main:app --reload
```
This will launch the API at `http://localhost:8000`.
