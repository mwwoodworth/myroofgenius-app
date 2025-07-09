from fastapi import FastAPI

app = FastAPI(title="MyRoofGenius API", version="0.1.0", docs_url="/docs")


@app.get("/health")
def health() -> dict[str, str]:
    """Simple health-check route used by Render and CI."""
    return {"status": "ok"}
