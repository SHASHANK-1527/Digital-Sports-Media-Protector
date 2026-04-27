from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import register, detect, assets

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
