"""
Scheme eligibility engine.
Checks eligibility for government healthcare schemes like Ayushman Bharat.
"""
from typing import List, Dict, Any, Optional
from models.schemas import SchemeResult


# Procedures covered under Ayushman Bharat (PMJAY)
AYUSHMAN_PROCEDURES = {
    "Knee Replacement": 80000,
    "Hip Replacement": 80000,
    "Heart Bypass Surgery": 170000,
    "Angioplasty": 90000,
    "Cataract Surgery": 30000,
    "Cancer Chemotherapy": 50000,
    "Cancer Radiation": 50000,
    "Appendectomy": 25000,
    "Hernia Repair": 25000,
    "Gallbladder Surgery": 35000,
    "Spine Surgery": 130000,
    "Brain Surgery": 150000,
    "Kidney Dialysis": 20000,
}


def check_ayushman_eligibility(
    procedure: str,
    hospitals: List[Dict[str, Any]],
) -> SchemeResult:
    """
    Check if a procedure is eligible under Ayushman Bharat (PMJAY).

    Args:
        procedure: Name of the medical procedure
        hospitals: List of hospital data (to find supported ones)

    Returns:
        SchemeResult with eligibility status
    """
    # Find coverage amount (fuzzy match on procedure name)
    coverage = None
    matched_procedure = None
    procedure_lower = procedure.lower()

    for proc_name, amount in AYUSHMAN_PROCEDURES.items():
        if proc_name.lower() in procedure_lower or procedure_lower in proc_name.lower():
            coverage = amount
            matched_procedure = proc_name
            break

    # Also try partial keyword matching
    if coverage is None:
        proc_keywords = procedure_lower.split()
        for proc_name, amount in AYUSHMAN_PROCEDURES.items():
            proc_name_lower = proc_name.lower()
            if any(kw in proc_name_lower for kw in proc_keywords if len(kw) > 3):
                coverage = amount
                matched_procedure = proc_name
                break

    if coverage is None:
        return SchemeResult(
            scheme_name="Ayushman Bharat (PMJAY)",
            eligible=False,
            details=f"The procedure '{procedure}' may not be covered under Ayushman Bharat. "
                    "Please check with your nearest Common Service Centre (CSC) for verification."
        )

    # Find hospitals that support the scheme
    supported = [
        h["hospital_name"] for h in hospitals
        if h.get("scheme_supported", False)
    ]

    return SchemeResult(
        scheme_name="Ayushman Bharat (PMJAY)",
        eligible=True,
        coverage_amount=coverage,
        supported_hospitals=supported,
        details=f"'{matched_procedure}' is covered under Ayushman Bharat with coverage up to "
                f"₹{coverage:,}. Eligibility depends on family being listed in SECC database. "
                "Visit your nearest CSC or call 14555 to check your eligibility."
    )
