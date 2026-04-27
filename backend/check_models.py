import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No GEMINI_API_KEY found in .env file.")
else:
    try:
        genai.configure(api_key=api_key)
        print(f"Checking models for key: {api_key[:10]}...")
        
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"✅ Available: {m.name}")
    except Exception as e:
        print(f"❌ Error: {e}")
