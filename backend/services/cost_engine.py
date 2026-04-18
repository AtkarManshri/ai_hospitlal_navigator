"""
Cost estimation engine.
Generates detailed cost breakdowns with city/age/comorbidity adjustments.
All outputs are ranges — never exact pricing.
"""
from typing import Optional, List, Dict, Any
from models.schemas import CostBreakdownItem, CostEstimate, CostRange
from utils.helpers import format_cost_range


# City-based cost multipliers
CITY_MULTIPLIERS = {
    "Mumbai": 1.30,
    "Delhi": 1.20,
    "Bangalore": 1.15,
    "Chennai": 1.10,
    "Pune": 1.00,
}

# Procedure-specific cost distribution (percentage of total)
COST_DISTRIBUTION = {
    "default": {
        "procedure_cost": 0.40,
        "doctor_fee": 0.20,
        "hospital_stay": 0.15,
        "diagnostics": 0.10,
        "medicines": 0.10,
        "contingency": 0.05,
    },
    "Knee Replacement": {
        "procedure_cost": 0.35,
        "doctor_fee": 0.20,
        "hospital_stay": 0.20,
        "diagnostics": 0.08,
        "medicines": 0.12,
        "contingency": 0.05,
    },
    "Heart Bypass Surgery": {
        "procedure_cost": 0.45,
        "doctor_fee": 0.20,
        "hospital_stay": 0.15,
        "diagnostics": 0.08,
        "medicines": 0.07,
        "contingency": 0.05,
    },
    "Cataract Surgery": {
        "procedure_cost": 0.50,
        "doctor_fee": 0.25,
        "hospital_stay": 0.05,
        "diagnostics": 0.10,
        "medicines": 0.05,
        "contingency": 0.05,
    },
}


def get_age_adjustment(age: Optional[int]) -> float:
    """
    Adjust costs based on patient age.
    Older and very young patients typically incur higher costs.
    """
    if age is None:
        return 1.0
    if age < 12:
        return 1.10  # Pediatric care premium
    if age < 40:
        return 1.00  # Standard
    if age < 60:
        return 1.05  # Slight increase
    if age < 75:
        return 1.15  # Moderate increase
    return 1.25  # Elderly care premium


def get_comorbidity_adjustment(comorbidities: Optional[List[str]]) -> float:
    """
    Adjust costs based on number of comorbidities.
    More conditions = higher risk = higher cost.
    """
    if not comorbidities:
        return 1.0
    count = len(comorbidities)
    if count == 1:
        return 1.05
    if count == 2:
        return 1.12
    return 1.20  # 3 or more


def estimate_cost(
    hospital: Dict[str, Any],
    procedure: str,
    city: str,
    age: Optional[int] = None,
    comorbidities: Optional[List[str]] = None,
) -> CostEstimate:
    """
    Generate a detailed cost estimate for a procedure at a specific hospital.

    Args:
        hospital: Hospital data dict
        procedure: Name of the medical procedure
        city: City where the hospital is located
        age: Patient age (optional)
        comorbidities: List of existing conditions (optional)

    Returns:
        CostEstimate with detailed breakdown
    """
    # Base cost range from hospital data
    base_min = hospital.get("avg_cost_range", {}).get("min", 100000)
    base_max = hospital.get("avg_cost_range", {}).get("max", 500000)

    # Apply adjustments
    city_mult = CITY_MULTIPLIERS.get(city, 1.0)
    age_adj = get_age_adjustment(age)
    comorbidity_adj = get_comorbidity_adjustment(comorbidities)

    total_mult = city_mult * age_adj * comorbidity_adj

    adjusted_min = int(base_min * total_mult)
    adjusted_max = int(base_max * total_mult)

    # Get cost distribution for the procedure
    distribution = COST_DISTRIBUTION.get(procedure, COST_DISTRIBUTION["default"])

    # Calculate breakdown
    breakdown = CostBreakdownItem(
        procedure_cost=CostRange(
            min=int(adjusted_min * distribution["procedure_cost"]),
            max=int(adjusted_max * distribution["procedure_cost"])
        ),
        doctor_fee=CostRange(
            min=int(adjusted_min * distribution["doctor_fee"]),
            max=int(adjusted_max * distribution["doctor_fee"])
        ),
        hospital_stay=CostRange(
            min=int(adjusted_min * distribution["hospital_stay"]),
            max=int(adjusted_max * distribution["hospital_stay"])
        ),
        diagnostics=CostRange(
            min=int(adjusted_min * distribution["diagnostics"]),
            max=int(adjusted_max * distribution["diagnostics"])
        ),
        medicines=CostRange(
            min=int(adjusted_min * distribution["medicines"]),
            max=int(adjusted_max * distribution["medicines"])
        ),
        contingency=CostRange(
            min=int(adjusted_min * distribution["contingency"]),
            max=int(adjusted_max * distribution["contingency"])
        ),
        total=CostRange(min=adjusted_min, max=adjusted_max)
    )

    return CostEstimate(
        hospital_id=hospital.get("hospital_id", ""),
        hospital_name=hospital.get("hospital_name", ""),
        procedure=procedure,
        breakdown=breakdown,
        city_multiplier=city_mult,
        age_adjustment=age_adj,
        comorbidity_adjustment=comorbidity_adj,
        formatted_total=format_cost_range(adjusted_min, adjusted_max),
        disclaimer="Cost estimates are approximate ranges based on historical data. "
                   "Actual costs may vary depending on individual medical conditions, "
                   "complications, choice of doctor, room category, and hospital policies. "
                   "Please consult the hospital directly for accurate pricing."
    )


def estimate_costs_for_hospitals(
    hospitals: List[Dict[str, Any]],
    procedure: str,
    age: Optional[int] = None,
    comorbidities: Optional[List[str]] = None,
) -> List[CostEstimate]:
    """Generate cost estimates for multiple hospitals."""
    return [
        estimate_cost(h, procedure, h.get("city", ""), age, comorbidities)
        for h in hospitals
    ]
