"""
Agent 3: Decision Support Agent
Generates ranking explanations and treatment pathways using LLM.
Falls back to template-based generation when LLM is unavailable.
"""
import os
from typing import List, Optional, Dict, Any
from models.schemas import (
    RankedHospital,
    TreatmentPathway,
    TreatmentStep,
    IntentResult,
)

_llm = None


def _init_llm():
    """Initialize LLM for text generation."""
    global _llm
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return False
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.3,
        )
        return True
    except Exception as e:
        print(f"[DecisionAgent] LLM init failed: {e}")
        return False


def generate_ranking_explanation(hospital: RankedHospital, rank: int) -> str:
    """
    Generate a human-readable explanation for why a hospital is ranked at a certain position.
    Uses deterministic template (no LLM needed for this).
    """
    scores = hospital.scores
    name = hospital.hospital.hospital_name

    parts = []

    if scores.specialization_match >= 0.8:
        parts.append(f"strong specialization match for this procedure")
    elif scores.specialization_match >= 0.5:
        parts.append(f"partial specialization coverage")

    if scores.rating_score >= 0.9:
        parts.append(f"exceptional patient ratings ({hospital.hospital.rating}/5)")
    elif scores.rating_score >= 0.8:
        parts.append(f"high patient ratings ({hospital.hospital.rating}/5)")

    if scores.distance_score >= 0.8:
        parts.append(f"conveniently located ({hospital.hospital.distance} km)")

    if scores.affordability_score >= 0.7:
        parts.append(f"competitive pricing")
    elif scores.affordability_score < 0.4:
        parts.append(f"premium pricing tier")

    if scores.reviews_score >= 0.85:
        parts.append(f"excellent patient reviews")

    if hospital.hospital.accreditation and "JCI" in hospital.hospital.accreditation:
        parts.append(f"JCI accredited (international quality standard)")

    if not parts:
        parts.append("balanced performance across all criteria")

    explanation = f"{name} is ranked #{rank} due to " + ", ".join(parts) + "."
    explanation += f" Overall score: {scores.total_score:.2f}/1.00."

    return explanation


def add_ranking_explanations(hospitals: List[RankedHospital]) -> List[RankedHospital]:
    """Add ranking explanations to all hospitals."""
    for h in hospitals:
        h.ranking_explanation = generate_ranking_explanation(h, h.rank)
    return hospitals


# Template-based treatment pathways
TREATMENT_TEMPLATES: Dict[str, List[Dict[str, str]]] = {
    "Knee Replacement": [
        {"stage": "symptoms", "title": "Symptoms Recognition",
         "description": "Persistent knee pain, stiffness, swelling, and difficulty in walking or climbing stairs. Pain worsens with activity and may disturb sleep.",
         "duration": "Ongoing"},
        {"stage": "diagnosis", "title": "Diagnosis & Assessment",
         "description": "Physical examination, X-rays, MRI scan to assess cartilage damage. Blood tests to rule out infections. Orthopedic surgeon consultation to evaluate severity.",
         "duration": "1-2 weeks"},
        {"stage": "treatment", "title": "Surgical Treatment",
         "description": "Total or partial knee replacement surgery under anesthesia. Damaged cartilage and bone are replaced with metal and plastic components. Hospital stay of 3-5 days.",
         "duration": "2-3 hours surgery + 3-5 days hospitalization"},
        {"stage": "recovery", "title": "Recovery & Rehabilitation",
         "description": "Physiotherapy starts within 24 hours. Walking with support in 1-2 days. Full recovery with physiotherapy in 3-6 months. Follow-up visits at 2 weeks, 6 weeks, and 3 months.",
         "duration": "3-6 months"},
    ],
    "Heart Bypass Surgery": [
        {"stage": "symptoms", "title": "Symptoms Recognition",
         "description": "Chest pain (angina), shortness of breath, fatigue during physical activity, irregular heartbeat. Symptoms worsen over time.",
         "duration": "Ongoing"},
        {"stage": "diagnosis", "title": "Diagnosis & Assessment",
         "description": "ECG, echocardiogram, stress test, coronary angiography to visualize blocked arteries. Cardiologist consultation to determine severity of blockages.",
         "duration": "1-2 weeks"},
        {"stage": "treatment", "title": "Surgical Treatment",
         "description": "Coronary Artery Bypass Grafting (CABG) under general anesthesia. Healthy blood vessels from leg or chest are used to bypass blocked arteries. Hospital stay of 7-10 days.",
         "duration": "4-6 hours surgery + 7-10 days hospitalization"},
        {"stage": "recovery", "title": "Recovery & Rehabilitation",
         "description": "ICU monitoring for 1-2 days. Cardiac rehabilitation program. Gradual return to normal activities in 6-12 weeks. Lifelong medication and lifestyle changes.",
         "duration": "6-12 weeks active recovery"},
    ],
    "Cataract Surgery": [
        {"stage": "symptoms", "title": "Symptoms Recognition",
         "description": "Blurred or cloudy vision, difficulty seeing at night, sensitivity to light and glare, seeing halos around lights, frequent changes in eyeglass prescription.",
         "duration": "Gradual onset"},
        {"stage": "diagnosis", "title": "Diagnosis & Assessment",
         "description": "Comprehensive eye exam including visual acuity test, slit-lamp examination, and retinal exam. Measurement of eye for intraocular lens (IOL) selection.",
         "duration": "1-2 visits"},
        {"stage": "treatment", "title": "Surgical Treatment",
         "description": "Phacoemulsification (ultrasound-based cataract removal) and artificial lens implantation. Performed under local anesthesia as a day-care procedure.",
         "duration": "30-45 minutes surgery, same-day discharge"},
        {"stage": "recovery", "title": "Recovery & Aftercare",
         "description": "Eye drops for 4-6 weeks. Avoid heavy lifting and swimming for 2 weeks. Vision improves within days. Follow-up visits at 1 day, 1 week, and 1 month.",
         "duration": "4-6 weeks"},
    ],
}

DEFAULT_TEMPLATE = [
    {"stage": "symptoms", "title": "Symptoms Recognition",
     "description": "Identification and monitoring of symptoms that indicate the need for medical attention. Consult a healthcare professional if symptoms persist.",
     "duration": "Varies"},
    {"stage": "diagnosis", "title": "Diagnosis & Assessment",
     "description": "Comprehensive diagnostic workup including physical examination, lab tests, and imaging studies as required. Specialist consultation for treatment planning.",
     "duration": "1-2 weeks"},
    {"stage": "treatment", "title": "Treatment",
     "description": "Treatment plan tailored to the specific condition, which may include medication, minimally invasive procedures, or surgery. Hospital stay duration varies by procedure.",
     "duration": "Varies by procedure"},
    {"stage": "recovery", "title": "Recovery & Follow-up",
     "description": "Post-treatment recovery with regular follow-up visits. Rehabilitation or physiotherapy as needed. Medication management and lifestyle modifications.",
     "duration": "Varies"},
]


async def generate_treatment_pathway(
    condition: str,
    procedure: str,
) -> TreatmentPathway:
    """
    Generate a treatment pathway for the given condition and procedure.
    Tries LLM generation first, falls back to templates.
    """
    global _llm

    # Try LLM-based generation
    if _llm is not None or _init_llm():
        try:
            prompt = f"""Generate a concise 4-step treatment pathway for:
Condition: {condition}
Procedure: {procedure}

Return exactly 4 steps in this format for each step:
Stage: [symptoms/diagnosis/treatment/recovery]
Title: [Brief title]
Description: [2-3 sentence description]
Duration: [Expected timeframe]

Be medically accurate but accessible to patients. Keep it concise."""

            response = await _llm.ainvoke(prompt)
            steps = _parse_llm_pathway(response.content, condition, procedure)
            if steps:
                return TreatmentPathway(
                    condition=condition,
                    procedure=procedure,
                    steps=steps,
                )
        except Exception as e:
            print(f"[DecisionAgent] LLM pathway generation failed: {e}")

    # Fallback to template
    template = TREATMENT_TEMPLATES.get(procedure, DEFAULT_TEMPLATE)

    steps = [
        TreatmentStep(
            stage=step["stage"],
            title=step["title"],
            description=step["description"],
            duration=step.get("duration"),
        )
        for step in template
    ]

    return TreatmentPathway(
        condition=condition,
        procedure=procedure,
        steps=steps,
    )


def _parse_llm_pathway(text: str, condition: str, procedure: str) -> Optional[List[TreatmentStep]]:
    """Parse LLM response into treatment steps."""
    try:
        steps = []
        current_step = {}

        for line in text.strip().split("\n"):
            line = line.strip()
            if not line:
                if current_step.get("stage"):
                    steps.append(current_step)
                    current_step = {}
                continue

            if line.lower().startswith("stage:"):
                if current_step.get("stage"):
                    steps.append(current_step)
                current_step = {"stage": line.split(":", 1)[1].strip().lower()}
            elif line.lower().startswith("title:"):
                current_step["title"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("description:"):
                current_step["description"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("duration:"):
                current_step["duration"] = line.split(":", 1)[1].strip()

        if current_step.get("stage"):
            steps.append(current_step)

        if len(steps) >= 3:
            return [
                TreatmentStep(
                    stage=s.get("stage", "unknown"),
                    title=s.get("title", "Step"),
                    description=s.get("description", ""),
                    duration=s.get("duration"),
                )
                for s in steps
            ]
    except Exception:
        pass
    return None
