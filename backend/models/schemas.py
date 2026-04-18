from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


class CostCategory(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class HospitalType(str, Enum):
    PRIVATE = "Private"
    GOVERNMENT = "Government"
    TRUST = "Trust"


# --- Request Models ---

class SearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query")
    age: Optional[int] = Field(None, description="Patient age (optional)")
    comorbidities: Optional[List[str]] = Field(default_factory=list, description="Existing conditions")


class CostRequest(BaseModel):
    hospital_id: str
    procedure: str
    city: str
    age: Optional[int] = None
    comorbidities: Optional[List[str]] = Field(default_factory=list)


class CompareRequest(BaseModel):
    hospital_ids: List[str] = Field(..., min_length=2, max_length=4)
    procedure: str


class SchemeRequest(BaseModel):
    procedure: str
    city: Optional[str] = None


# --- Data Models ---

class Review(BaseModel):
    reviewer: str
    rating: float
    comment: str
    date: str


class CostRange(BaseModel):
    min: int
    max: int


class Hospital(BaseModel):
    hospital_id: str
    hospital_name: str
    city: str
    hospital_type: HospitalType = HospitalType.PRIVATE
    specialization: List[str]
    rating: float
    cost_category: CostCategory
    avg_cost_range: CostRange
    distance: float  # km from city center
    reviews: List[Review]
    scheme_supported: bool
    accreditation: Optional[str] = None
    established_year: Optional[int] = None
    bed_count: Optional[int] = None


# --- Response Models ---

class IntentResult(BaseModel):
    condition: str
    procedure: str
    location: str
    budget: Optional[int] = None
    confidence: float = Field(..., ge=0, le=1)
    raw_query: str


class RankingScores(BaseModel):
    specialization_match: float
    rating_score: float
    distance_score: float
    affordability_score: float
    reviews_score: float
    total_score: float


class RankedHospital(BaseModel):
    hospital: Hospital
    scores: RankingScores
    rank: int
    tags: List[str] = Field(default_factory=list)
    ranking_explanation: Optional[str] = None


class CostBreakdownItem(BaseModel):
    procedure_cost: CostRange
    doctor_fee: CostRange
    hospital_stay: CostRange
    diagnostics: CostRange
    medicines: CostRange
    contingency: CostRange
    total: CostRange


class CostEstimate(BaseModel):
    hospital_id: str
    hospital_name: str
    procedure: str
    breakdown: CostBreakdownItem
    city_multiplier: float
    age_adjustment: float
    comorbidity_adjustment: float
    formatted_total: str  # e.g., "₹2,00,000 – ₹3,00,000"
    disclaimer: str


class TreatmentStep(BaseModel):
    stage: str
    title: str
    description: str
    duration: Optional[str] = None


class TreatmentPathway(BaseModel):
    condition: str
    procedure: str
    steps: List[TreatmentStep]


class SchemeResult(BaseModel):
    scheme_name: str
    eligible: bool
    coverage_amount: Optional[int] = None
    supported_hospitals: List[str] = Field(default_factory=list)
    details: Optional[str] = None


class SearchResponse(BaseModel):
    intent: IntentResult
    hospitals: List[RankedHospital]
    cost_estimates: List[CostEstimate]
    treatment_pathway: Optional[TreatmentPathway] = None
    schemes: List[SchemeResult] = Field(default_factory=list)
    disclaimer: str = "This platform provides estimated costs for informational purposes only. Actual costs may vary based on individual medical conditions, complications, and hospital policies. Always consult with healthcare professionals before making medical decisions."


class CompareResponse(BaseModel):
    hospitals: List[RankedHospital]
    cost_estimates: List[CostEstimate]
    procedure: str
    disclaimer: str = "Cost comparisons are approximate and for informational purposes only."
