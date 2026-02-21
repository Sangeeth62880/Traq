"""
TRAQ ML Prediction Service
FastAPI application for crowd prediction using XGBoost
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(
    title="TRAQ ML Prediction Service",
    description="Crowd prediction microservice for Indian Railways coach occupancy",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "traq-ml-service",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": False,
    }


@app.get("/")
async def root():
    return {
        "message": "TRAQ ML Prediction Service",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "model_health": "/model/health",
            "retrain": "/model/retrain",
        },
    }
