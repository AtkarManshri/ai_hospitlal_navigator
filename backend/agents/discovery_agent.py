"""
Agent 2: Provider Discovery Agent
Fetches and filters hospitals based on location and specialization.
Uses the structured dataset with simulated multi-source enrichment.
"""
from typing import List, Dict, Any, Optional
from utils.helpers import load_hospitals, match_specialization


# Cache loaded data
_hospitals_cache: Optional[List[Dict[str, Any]]] = None


def _get_hospitals() -> List[Dict[str, Any]]:
    """Load hospitals with caching."""
    global _hospitals_cache
    if _hospitals_cache is None:
        _hospitals_cache = load_hospitals()
    return _hospitals_cache


def discover_providers(
    location: Optional[str] = None,
    specialization: Optional[str] = None,
    procedure: Optional[str] = None,
    budget: Optional[int] = None,
    hospital_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Discover hospitals matching the search criteria.

    Args:
        location: City name (e.g., "Pune")
        specialization: Required specialization (e.g., "Orthopedics")
        procedure: Procedure name for specialization matching
        budget: Budget filter
        hospital_type: Filter by type (Private, Government, Trust)

    Returns:
        Filtered list of hospital dicts
    """
    hospitals = _get_hospitals()
    results = []

    # Determine required specializations from procedure name
    required_specs = []
    if specialization:
        required_specs = [specialization]
    elif procedure:
        required_specs = match_specialization(procedure)

    for h in hospitals:
        # Location filter
        if location and h.get("city", "").lower() != location.lower():
            continue

        # Specialization filter (at least one match)
        if required_specs:
            hospital_specs = h.get("specialization", [])
            if not any(spec in hospital_specs for spec in required_specs):
                continue

        # Hospital type filter
        if hospital_type and h.get("hospital_type", "").lower() != hospital_type.lower():
            continue

        # Budget filter (check if min cost is within 1.5x of budget)
        if budget is not None:
            min_cost = h.get("avg_cost_range", {}).get("min", 0)
            if min_cost > budget * 1.5:
                continue

        results.append(h)

    # If no results with location filter, try without it
    if not results and location:
        return discover_providers(
            location=None,
            specialization=specialization,
            procedure=procedure,
            budget=budget,
            hospital_type=hospital_type,
        )

    return _enrich_providers(results)


def _enrich_providers(hospitals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Simulate multi-source data enrichment.
    In production, this would aggregate from multiple APIs.
    """
    for h in hospitals:
        # Simulate accreditation proxy scoring
        accreditation = h.get("accreditation", "")
        if "JCI" in accreditation:
            h["accreditation_score"] = 1.0
        elif "NABH" in accreditation:
            h["accreditation_score"] = 0.8
        else:
            h["accreditation_score"] = 0.5

        # Simulate review sentiment (based on existing review ratings)
        reviews = h.get("reviews", [])
        if reviews:
            avg_rating = sum(r.get("rating", 3.0) for r in reviews) / len(reviews)
            h["review_sentiment"] = "positive" if avg_rating >= 4.0 else "mixed" if avg_rating >= 3.0 else "negative"
        else:
            h["review_sentiment"] = "unknown"

    return hospitals


def get_hospital_by_id(hospital_id: str) -> Optional[Dict[str, Any]]:
    """Get a single hospital by its ID."""
    hospitals = _get_hospitals()
    for h in hospitals:
        if h.get("hospital_id") == hospital_id:
            return h
    return None


def get_hospitals_by_ids(hospital_ids: List[str]) -> List[Dict[str, Any]]:
    """Get multiple hospitals by their IDs."""
    hospitals = _get_hospitals()
    return [h for h in hospitals if h.get("hospital_id") in hospital_ids]
