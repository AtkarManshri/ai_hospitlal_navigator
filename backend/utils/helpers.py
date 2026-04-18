"""
Utility helpers for normalization, formatting, and data loading.
"""
import json
import os
import re
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_hospitals() -> List[Dict[str, Any]]:
    """Load hospital dataset from JSON file."""
    filepath = os.path.join(DATA_DIR, "hospitals.json")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def normalize_value(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-1 range."""
    if max_val == min_val:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def format_inr(amount: int) -> str:
    """Format an integer as Indian Rupee string (e.g., ₹2,00,000)."""
    s = str(amount)
    if len(s) <= 3:
        return f"₹{s}"

    last_three = s[-3:]
    remaining = s[:-3]
    # Add commas every 2 digits in the remaining part (Indian numbering)
    parts = []
    while len(remaining) > 2:
        parts.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    if remaining:
        parts.insert(0, remaining)

    formatted = ",".join(parts) + "," + last_three
    return f"₹{formatted}"


def format_cost_range(min_cost: int, max_cost: int) -> str:
    """Format a cost range as a readable string."""
    return f"{format_inr(min_cost)} – {format_inr(max_cost)}"


def calculate_avg_review_score(reviews: List[Dict[str, Any]]) -> float:
    """Calculate average review rating (0-1 normalized from 0-5 scale)."""
    if not reviews:
        return 0.5
    avg = sum(r.get("rating", 3.0) for r in reviews) / len(reviews)
    return avg / 5.0  # Normalize to 0-1


def extract_budget_from_text(text: str) -> int | None:
    """Try to extract a budget number from text like '2 lakh', '500000', '5L'."""
    text = text.lower().strip()

    # Match patterns like "2 lakh", "2lakh", "2 lakhs"
    match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)', text)
    if match:
        return int(float(match.group(1)) * 100000)

    # Match patterns like "5L", "5l"
    match = re.search(r'(\d+(?:\.\d+)?)\s*l\b', text)
    if match:
        return int(float(match.group(1)) * 100000)

    # Match patterns like "200000", "2,00,000"
    match = re.search(r'(\d{1,3}(?:,\d{2,3})*(?:,\d{3})?|\d{4,})', text)
    if match:
        num_str = match.group(1).replace(",", "")
        val = int(num_str)
        if val >= 10000:  # Only consider as budget if > 10k
            return val

    return None


CITY_ALIASES = {
    "mumbai": "Mumbai", "bombay": "Mumbai",
    "pune": "Pune", "poona": "Pune",
    "delhi": "Delhi", "new delhi": "Delhi", "ncr": "Delhi",
    "bangalore": "Bangalore", "bengaluru": "Bangalore",
    "chennai": "Chennai", "madras": "Chennai",
}


def normalize_city(city: str) -> str | None:
    """Normalize city name to standard form."""
    if not city:
        return None
    return CITY_ALIASES.get(city.lower().strip(), city.title())


SPECIALIZATION_KEYWORDS = {
    "Cardiology": ["heart", "cardiac", "cardio", "chest pain", "bypass", "angioplasty", "stent"],
    "Orthopedics": ["knee", "hip", "bone", "joint", "fracture", "orthopedic", "spine", "back pain", "shoulder"],
    "Oncology": ["cancer", "tumor", "chemo", "oncology", "malignant", "biopsy"],
    "Neurology": ["brain", "neuro", "nerve", "stroke", "epilepsy", "headache", "migraine", "spine surgery"],
    "Ophthalmology": ["eye", "vision", "cataract", "lasik", "retina", "glaucoma"],
    "General Surgery": ["surgery", "appendix", "hernia", "gallbladder", "general"],
}


def match_specialization(query: str) -> List[str]:
    """Match query text to possible specializations."""
    query_lower = query.lower()
    matches = []
    for spec, keywords in SPECIALIZATION_KEYWORDS.items():
        for kw in keywords:
            if kw in query_lower:
                if spec not in matches:
                    matches.append(spec)
                break
    return matches


def extract_city_from_text(text: str) -> str | None:
    """Extract city name from text."""
    text_lower = text.lower()
    for alias, city in CITY_ALIASES.items():
        if alias in text_lower:
            return city
    return None
