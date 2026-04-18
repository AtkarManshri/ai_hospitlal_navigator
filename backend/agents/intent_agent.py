"""
Agent 1: Intent Mapping Agent
Converts natural language queries into structured search intent.
Uses Google Gemini via LangChain, with keyword-based fallback.
"""
import os
import json
import re
from typing import Optional
from models.schemas import IntentResult
from utils.helpers import (
    extract_budget_from_text,
    extract_city_from_text,
    match_specialization,
)

# LLM availability flag
_llm = None
_chain = None


def _init_llm():
    """Initialize the LLM chain (lazy loading)."""
    global _llm, _chain

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return False

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser

        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.1,
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a medical intent parser. Given a user's healthcare search query, extract structured information.

You must return a valid JSON object with these fields:
- "condition": The medical condition (e.g., "Osteoarthritis", "Coronary Artery Disease")
- "procedure": The likely medical procedure (e.g., "Knee Replacement", "Heart Bypass Surgery")
- "location": The city in India (e.g., "Pune", "Mumbai", "Delhi", "Bangalore", "Chennai")
- "budget": The budget in INR as an integer (e.g., 200000), or null if not specified
- "confidence": Your confidence score from 0.0 to 1.0

Map symptoms to conditions:
- knee pain, joint pain → Osteoarthritis → Knee Replacement
- chest pain, heart attack → Coronary Artery Disease → Heart Bypass Surgery / Angioplasty
- eye problem, blurred vision → Cataract → Cataract Surgery
- back pain, spine issue → Spinal Stenosis → Spine Surgery
- cancer, tumor → Cancer → Cancer Chemotherapy / Surgery
- headache, seizures → Brain Condition → Neurosurgery / Treatment

If information is ambiguous or missing, make your best guess and lower the confidence score.
Always return valid JSON only, no markdown formatting."""),
            ("human", "{query}")
        ])

        _chain = prompt | _llm | JsonOutputParser()
        return True
    except Exception as e:
        print(f"[IntentAgent] LLM init failed: {e}")
        return False


# Symptom → Condition → Procedure mapping for fallback
SYMPTOM_MAP = {
    "knee": {"condition": "Osteoarthritis", "procedure": "Knee Replacement"},
    "joint": {"condition": "Osteoarthritis", "procedure": "Joint Replacement"},
    "hip": {"condition": "Hip Arthritis", "procedure": "Hip Replacement"},
    "heart": {"condition": "Coronary Artery Disease", "procedure": "Heart Bypass Surgery"},
    "cardiac": {"condition": "Coronary Artery Disease", "procedure": "Heart Bypass Surgery"},
    "chest pain": {"condition": "Coronary Artery Disease", "procedure": "Angioplasty"},
    "bypass": {"condition": "Coronary Artery Disease", "procedure": "Heart Bypass Surgery"},
    "angioplasty": {"condition": "Coronary Artery Disease", "procedure": "Angioplasty"},
    "stent": {"condition": "Coronary Artery Disease", "procedure": "Angioplasty"},
    "cancer": {"condition": "Cancer", "procedure": "Cancer Chemotherapy"},
    "tumor": {"condition": "Cancer", "procedure": "Cancer Surgery"},
    "eye": {"condition": "Cataract", "procedure": "Cataract Surgery"},
    "cataract": {"condition": "Cataract", "procedure": "Cataract Surgery"},
    "vision": {"condition": "Cataract", "procedure": "Cataract Surgery"},
    "lasik": {"condition": "Refractive Error", "procedure": "LASIK Surgery"},
    "brain": {"condition": "Brain Condition", "procedure": "Brain Surgery"},
    "neuro": {"condition": "Neurological Condition", "procedure": "Neurosurgery"},
    "headache": {"condition": "Neurological Condition", "procedure": "Neurological Treatment"},
    "spine": {"condition": "Spinal Stenosis", "procedure": "Spine Surgery"},
    "back pain": {"condition": "Spinal Condition", "procedure": "Spine Surgery"},
    "appendix": {"condition": "Appendicitis", "procedure": "Appendectomy"},
    "hernia": {"condition": "Hernia", "procedure": "Hernia Repair"},
    "gallbladder": {"condition": "Gallstones", "procedure": "Gallbladder Surgery"},
    "kidney": {"condition": "Kidney Disease", "procedure": "Kidney Dialysis"},
    "fracture": {"condition": "Bone Fracture", "procedure": "Fracture Fixation"},
}


def _fallback_parse(query: str) -> IntentResult:
    """
    Keyword-based fallback parser when LLM is unavailable.
    """
    query_lower = query.lower()

    # Extract condition and procedure
    condition = "General Health Condition"
    procedure = "Medical Consultation"
    confidence = 0.4  # Lower confidence for fallback

    for keyword, mapping in SYMPTOM_MAP.items():
        if keyword in query_lower:
            condition = mapping["condition"]
            procedure = mapping["procedure"]
            confidence = 0.65
            break

    # Extract location
    location = extract_city_from_text(query) or "Mumbai"

    # Extract budget
    budget = extract_budget_from_text(query)

    return IntentResult(
        condition=condition,
        procedure=procedure,
        location=location,
        budget=budget,
        confidence=confidence,
        raw_query=query,
    )


async def parse_intent(query: str) -> IntentResult:
    """
    Parse a natural language healthcare query into structured intent.

    Tries LLM first, falls back to keyword matching.

    Args:
        query: Natural language search query

    Returns:
        IntentResult with condition, procedure, location, budget, confidence
    """
    global _chain

    # Try LLM-based parsing
    if _chain is not None or _init_llm():
        try:
            result = await _chain.ainvoke({"query": query})

            # Validate and construct IntentResult
            return IntentResult(
                condition=result.get("condition", "Unknown Condition"),
                procedure=result.get("procedure", "Medical Consultation"),
                location=result.get("location", "Mumbai"),
                budget=result.get("budget"),
                confidence=min(1.0, max(0.0, float(result.get("confidence", 0.7)))),
                raw_query=query,
            )
        except Exception as e:
            print(f"[IntentAgent] LLM parsing failed, using fallback: {e}")

    # Fallback to keyword-based parsing
    return _fallback_parse(query)
