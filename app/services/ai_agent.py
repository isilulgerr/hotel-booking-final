# app/services/ai_agent.py

import os
import json
import re
from datetime import datetime
from openai import OpenAI

from dotenv import load_dotenv  

load_dotenv()  
print("✅ Loaded OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def parse_intent_message(message: str):
    """
    AI sadece şu formatta cevap döner:
    {
        "intent": "search_hotel" or "book_room",
        ... ek parametreler ...
    }
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Parse the user message and identify intent.\n"
                        "Respond only in JSON format like:\n"
                        "{ \"intent\": \"search_hotel\", \"city\": \"Rome\", \"budget\": 300, \"check_in\": \"2025-07-15\", \"check_out\": \"2025-07-18\", \"preferences\": [\"pool\"], \"min_rating\": 4 }\n"
                        "or:\n"
                        "{ \"intent\": \"book_room\", \"room_id\": 1, \"check_in\": \"2025-07-15\", \"check_out\": \"2025-07-18\", \"people\": 2 }\n"
                        "Do NOT explain anything."
                    )
                },
                { "role": "user", "content": message }
            ],
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print("🧠 AI ERROR:", e)
        return {"error": "AI failed to parse."}
