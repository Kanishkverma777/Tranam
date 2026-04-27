import asyncio
import json
from app.services.risk_engine import assess_job_risk

async def main():
    # Test Case: High Risk Scenario
    # 6-meter deep sewer, reported smell, rainy weather, missing gas detector.
    job_data = {
        "sewer_depth": 6.5,
        "smell_reported": True,
        "weather": "heavy_rain",
        "equipment_available": ["harness", "rope", "flashlight"], # Missing gas detector and mask
        "sewer_type": "industrial",
        "estimated_duration": 45
    }

    print("--- 🔍 Sending High-Risk Job to Gemini AI ---")
    print(f"Data: {json.dumps(job_data, indent=2)}")
    
    result = await assess_job_risk(job_data)
    
    print("\n--- 🤖 Gemini Safety Assessment ---")
    print(f"RISK LEVEL: {result.get('risk_level')}")
    print(f"RISK SCORE: {result.get('risk_score')}/100")
    print(f"SAFE TO ENTER: {result.get('safe_to_enter')}")
    print(f"PRIMARY HAZARDS: {', '.join(result.get('primary_hazards', []))}")
    print(f"RECOMMENDATION: {result.get('recommendation')}")
    print(f"REQUIRED PRECAUTIONS: {', '.join(result.get('required_precautions', []))}")

if __name__ == "__main__":
    asyncio.run(main())
