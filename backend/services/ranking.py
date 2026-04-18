"""
Deterministic ranking engine for hospitals.

Score = 0.3 * specialization_match + 0.2 * rating + 0.2 * distance + 0.2 * affordability + 0.1 * reviews_score

All values normalized to 0-1 range.
"""
from typing import List, Dict, Any, Optional
from models.schemas import RankingScores, RankedHospital, Hospital
from utils.helpers import normalize_value, calculate_avg_review_score


def compute_specialization_match(hospital_specs: List[str], required_specs: List[str]) -> float:
    """
    How well the hospital's specializations match the required procedure.
    Returns 0-1 score.
    """
    if not required_specs:
        return 0.5  # Neutral if no specific specialization needed

    matched = sum(1 for spec in required_specs if spec in hospital_specs)
    return matched / len(required_specs)


def compute_affordability(avg_cost_min: int, avg_cost_max: int, budget: Optional[int]) -> float:
    """
    How affordable the hospital is relative to user's budget.
    Higher score = more affordable.
    """
    avg_cost = (avg_cost_min + avg_cost_max) / 2

    if budget is None:
        # No budget specified — use inverse cost normalization
        # Use a reasonable max cost of 10 lakh for normalization
        return max(0.0, 1.0 - (avg_cost / 1000000))

    if avg_cost <= budget:
        # Within budget — score based on how much under budget
        return min(1.0, 0.6 + 0.4 * (1 - avg_cost / budget))
    else:
        # Over budget — penalize proportionally
        return max(0.0, 0.4 * (budget / avg_cost))


def compute_distance_score(distance: float, max_distance: float = 30.0) -> float:
    """
    Closer is better. Normalized inversely.
    """
    return max(0.0, 1.0 - (distance / max_distance))


def compute_rating_score(rating: float) -> float:
    """Normalize rating from 0-5 to 0-1."""
    return rating / 5.0


def rank_hospitals(
    hospitals: List[Dict[str, Any]],
    required_specializations: List[str],
    budget: Optional[int] = None,
    weights: Optional[Dict[str, float]] = None
) -> List[RankedHospital]:
    """
    Rank hospitals using the weighted scoring formula.

    Args:
        hospitals: List of hospital dicts from the dataset
        required_specializations: Specializations needed for the procedure
        budget: User's budget (optional)
        weights: Custom weights (optional, defaults to standard formula)

    Returns:
        Sorted list of RankedHospital objects (highest score first)
    """
    if weights is None:
        weights = {
            "specialization": 0.3,
            "rating": 0.2,
            "distance": 0.2,
            "affordability": 0.2,
            "reviews": 0.1,
        }

    scored_hospitals = []

    for h in hospitals:
        spec_score = compute_specialization_match(
            h.get("specialization", []),
            required_specializations
        )
        rating_score = compute_rating_score(h.get("rating", 3.0))
        distance_score = compute_distance_score(h.get("distance", 15.0))
        affordability_score = compute_affordability(
            h.get("avg_cost_range", {}).get("min", 100000),
            h.get("avg_cost_range", {}).get("max", 500000),
            budget
        )
        reviews_score = calculate_avg_review_score(h.get("reviews", []))

        total = (
            weights["specialization"] * spec_score +
            weights["rating"] * rating_score +
            weights["distance"] * distance_score +
            weights["affordability"] * affordability_score +
            weights["reviews"] * reviews_score
        )

        scores = RankingScores(
            specialization_match=round(spec_score, 3),
            rating_score=round(rating_score, 3),
            distance_score=round(distance_score, 3),
            affordability_score=round(affordability_score, 3),
            reviews_score=round(reviews_score, 3),
            total_score=round(total, 3)
        )

        # Generate tags
        tags = []
        if affordability_score >= 0.8:
            tags.append("Best Value")
        if rating_score >= 0.9:
            tags.append("Top Rated")
        if h.get("scheme_supported"):
            tags.append("Scheme Supported")
        if h.get("accreditation") and "JCI" in h.get("accreditation", ""):
            tags.append("JCI Accredited")
        if distance_score >= 0.85:
            tags.append("Nearby")

        hospital_obj = Hospital(**h)

        scored_hospitals.append(RankedHospital(
            hospital=hospital_obj,
            scores=scores,
            rank=0,  # Will be set after sorting
            tags=tags,
        ))

    # Sort by total score (descending)
    scored_hospitals.sort(key=lambda x: x.scores.total_score, reverse=True)

    # Assign ranks
    for i, sh in enumerate(scored_hospitals):
        sh.rank = i + 1

    return scored_hospitals
