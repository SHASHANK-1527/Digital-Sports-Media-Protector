from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

Path("/tmp/dap").mkdir(parents=True, exist_ok=True)

from routers import register, detect, assets, batch

app = FastAPI(title="Digital Asset Protection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(register.router)
app.include_router(detect.router)
app.include_router(assets.router)
app.include_router(batch.router)

@app.get("/health")
async def health_check():
    from db.firestore import db, db_id
    try:
        # Write test
        test_ref = db.collection("_health_test").document("test")
        test_ref.set({"timestamp": firestore.SERVER_TIMESTAMP, "msg": "hello"})
        
        # Read test
        doc = test_ref.get()
        write_test = "success" if doc.exists else "failed_read"
        
        collections = [c.id for c in db.collections()]
        return {
            "status": "healthy",
            "project_id": db.project,
            "database": db_id,
            "write_test": write_test,
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
