# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## Local Development

### Environment Variables
Copy `.env.example` to `.env` and provide values for the required secrets. Each
variable is described in [docs/vercel-env.md](docs/vercel-env.md).

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
5. Lint the code:
   ```bash
   npm run lint
   ```
6. Format the codebase:
   ```bash
   npm run format
   ```

### Backend (FastAPI)
The backend lives in `backend/main.py`.
Run it locally with [Uvicorn](https://www.uvicorn.org/):
```bash
pip install -r backend/backend/requirements.txt
uvicorn backend.main:app --reload
```
This will launch the API at `http://localhost:8000`.

### Vercel Build
Vercel runs `scripts/vercel_build.sh` which installs backend dependencies before
building the React app. This keeps the FastAPI backend functional in serverless
deployments.
