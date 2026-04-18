"""
MedCompare — AI-Powered Healthcare Decision Platform
FastAPI Backend Server
"""
import os
import sys
from contextlib import asynccontextmanager
from typing import List, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    SearchRequest,
    SearchResponse,
    CostRequest,
    CostEstimate,
    CompareRequest,
    CompareResponse,
    SchemeRequest,
    SchemeResult,
    RankedHospital,
    Hospital,
)
from agents.intent_agent import parse_intent
from agents.discovery_agent import discover_providers, get_hospital_by_id, get_hospitals_by_ids
from agents.decision_agent import (
    add_ranking_explanations,
    generate_treatment_pathway,
)
from services.ranking import rank_hospitals
from services.cost_engine import estimate_cost, estimate_costs_for_hospitals
from services.scheme_engine import check_ayushman_eligibility
from services.cache import cache_get, cache_set, make_cache_key
from utils.helpers import match_specialization


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    print("[MedCompare] Backend Starting...")
    key = os.environ.get('GOOGLE_API_KEY')
    has_key = key and key != 'your_api_key_here'
    print(f"   GOOGLE_API_KEY: {'SET' if has_key else 'NOT SET (using fallback mode)'}")
    yield
    print("[MedCompare] Backend Shutting Down...")


app = FastAPI(
    title="MedCompare API",
    description="AI-Powered Healthcare Decision Platform — Search, Compare, and Evaluate Treatment Options",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "MedCompare API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/api/search", "/api/hospitals", "/api/cost", "/api/compare", "/api/schemes"],
    }


@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Main search endpoint.
    Flow: User Query → Intent Mapping → Provider Discovery → Ranking → Cost Estimation → Response
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    # Check cache
    cache_key = make_cache_key(query)
    cached = cache_get(cache_key)
    if cached:
        return cached

    # Step 1: Intent Mapping (Agent 1)
    intent = await parse_intent(query)

    # Step 2: Provider Discovery (Agent 2)
    providers = discover_providers(
        location=intent.location,
        procedure=intent.procedure,
        budget=intent.budget,
    )

    if not providers:
        # Try broader search without location
        providers = discover_providers(procedure=intent.procedure, budget=intent.budget)

    # Step 3: Ranking (Deterministic)
    required_specs = match_specialization(intent.procedure)
    ranked = rank_hospitals(providers, required_specs, intent.budget)

    # Step 4: Add explanations (Agent 3)
    ranked = add_ranking_explanations(ranked)

    # Step 5: Cost Estimation
    cost_estimates = estimate_costs_for_hospitals(
        providers,
        intent.procedure,
        request.age,
        request.comorbidities,
    )

    # Step 6: Treatment Pathway
    pathway = await generate_treatment_pathway(intent.condition, intent.procedure)

    # Step 7: Scheme Check
    schemes = [check_ayushman_eligibility(intent.procedure, providers)]

    # Build response
    response = SearchResponse(
        intent=intent,
        hospitals=ranked,
        cost_estimates=cost_estimates,
        treatment_pathway=pathway,
        schemes=schemes,
    )

    # Cache the result
    cache_set(cache_key, response)

    return response


@app.get("/api/hospitals")
async def list_hospitals(
    city: Optional[str] = Query(None, description="Filter by city"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    hospital_type: Optional[str] = Query(None, description="Filter by type (Private, Government, Trust)"),
):
    """List and filter hospitals from the dataset."""
    providers = discover_providers(
        location=city,
        specialization=specialization,
        hospital_type=hospital_type,
    )
    return {"hospitals": [Hospital(**h) for h in providers], "count": len(providers)}


@app.post("/api/cost", response_model=CostEstimate)
async def get_cost(request: CostRequest):
    """Get detailed cost breakdown for a specific hospital and procedure."""
    hospital = get_hospital_by_id(request.hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail=f"Hospital {request.hospital_id} not found")

    return estimate_cost(
        hospital,
        request.procedure,
        request.city,
        request.age,
        request.comorbidities,
    )


@app.post("/api/compare", response_model=CompareResponse)
async def compare_hospitals(request: CompareRequest):
    """Compare multiple hospitals side by side."""
    hospitals = get_hospitals_by_ids(request.hospital_ids)

    if len(hospitals) < 2:
        raise HTTPException(
            status_code=404,
            detail="At least 2 valid hospital IDs are required for comparison"
        )

    # Rank the compared hospitals
    required_specs = match_specialization(request.procedure)
    ranked = rank_hospitals(hospitals, required_specs)
    ranked = add_ranking_explanations(ranked)

    # Get cost estimates
    cost_estimates = estimate_costs_for_hospitals(hospitals, request.procedure)

    return CompareResponse(
        hospitals=ranked,
        cost_estimates=cost_estimates,
        procedure=request.procedure,
    )


@app.get("/api/schemes", response_model=SchemeResult)
async def check_schemes(
    procedure: str = Query(..., description="Procedure name"),
    city: Optional[str] = Query(None, description="City filter"),
):
    """Check government scheme eligibility for a procedure."""
    providers = discover_providers(location=city)
    return check_ayushman_eligibility(procedure, providers)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
