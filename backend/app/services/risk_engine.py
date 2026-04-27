# SafeFlow Global — AI Risk Assessment Service

import json
import logging
from typing import Optional



from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


import google.generativeai as genai

async def assess_job_risk(job_data: dict) -> dict:
    """
    AI-powered risk assessment before manhole/sewer entry using Google Gemini.
    Falls back to rule-based scoring if the AI is unavailable.
    """
    if settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""You are a safety expert for confined space work.
Assess risk for this sewer entry job:
- Depth: {job_data.get('sewer_depth', 'unknown')}m
- Smell reported: {job_data.get('smell_reported', False)}
- Weather: {job_data.get('weather', 'clear')}
- Equipment: {json.dumps(job_data.get('equipment_available', []))}
- Sewer type: {job_data.get('sewer_type', 'combined')}
- Duration: {job_data.get('estimated_duration', 60)} min

Respond ONLY in valid JSON:
{{"risk_level":"GREEN|YELLOW|RED","risk_score":0,"primary_hazards":[],"recommendation":"","safe_to_enter":true,"required_precautions":[]}}"""

            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Handle markdown code blocks in response
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini API error: {e}. Falling back to rule-based engine.")

    # Fallback to Rule-based
    return _rule_based_risk(job_data)


def _rule_based_risk(job_data: dict) -> dict:
    """Fallback rule-based risk scoring."""
    score = 0
    hazards = []
    precautions = []

    depth = job_data.get("sewer_depth", 0) or 0
    if depth > 5:
        score += 25; hazards.append("Extreme depth — gas risk")
    elif depth > 3:
        score += 15; hazards.append("Significant depth")

    if job_data.get("smell_reported"):
        score += 20; hazards.append("Toxic gas likely (H2S, methane)")
        precautions.append("Full-face respirator mandatory")

    equipment = job_data.get("equipment_available", [])
    essential = ["mask", "harness", "rope", "flashlight", "gas_detector"]
    missing = [e for e in essential if e not in equipment]
    if len(missing) > 3:
        score += 20; hazards.append(f"Missing: {', '.join(missing)}")

    weather = job_data.get("weather", "clear").lower()
    if weather in ["rain", "heavy_rain", "storm"]:
        score += 15; hazards.append("Flooding risk")

    duration = job_data.get("estimated_duration", 60) or 60
    if duration > 120:
        score += 10; hazards.append("Extended duration — fatigue risk")

    if score < 30:
        level, safe = "GREEN", True
        rec = "Low risk. Proceed with standard precautions."
    elif score < 65:
        level, safe = "YELLOW", True
        rec = "Moderate risk. Ensure all safety equipment available."
    else:
        level, safe = "RED", False
        rec = "HIGH RISK — Entry not recommended without full safety gear."

    return {
        "risk_level": level, "risk_score": min(score, 100),
        "primary_hazards": hazards or ["No major hazards"],
        "recommendation": rec, "safe_to_enter": safe,
        "required_precautions": precautions or ["Standard PPE", "Surface standby"],
    }
