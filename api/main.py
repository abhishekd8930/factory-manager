"""
Factory Manager — FastAPI Backend
Serves financial calculation endpoints for the Factory Manager SPA.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    SalaryRequest, SalaryResponse,
    PieceRateRequest, PieceRateResponse,
    WageSummaryRequest, WageSummaryResponse,
)
from .calculations import (
    calculate_time_salary,
    calculate_piece_rate,
    calculate_wage_summary,
)

# ==========================================
# App Setup
# ==========================================

app = FastAPI(
    title="Factory Manager API",
    description="Financial calculation engine for Abhi Company's Factory Manager",
    version="1.0.0",
)

# Allow the Node.js frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Health Check
# ==========================================

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Factory Manager API", "version": "1.0.0"}


# ==========================================
# Endpoints
# ==========================================

@app.post("/api/calculate-salary", response_model=SalaryResponse)
def api_calculate_salary(req: SalaryRequest):
    """Calculate time-based (salaried) employee's monthly salary."""
    return calculate_time_salary(req)


@app.post("/api/calculate-piecerate", response_model=PieceRateResponse)
def api_calculate_piecerate(req: PieceRateRequest):
    """Calculate piece-rate employee's consolidated bill."""
    return calculate_piece_rate(req)


@app.post("/api/wage-summary", response_model=WageSummaryResponse)
def api_wage_summary(req: WageSummaryRequest):
    """Generate wage summary for all staff in a given month."""
    return calculate_wage_summary(req)
