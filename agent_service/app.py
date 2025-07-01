from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/api/v1/ai/parse", methods=["POST"])
def parse_message():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Missing message"}), 400

    # OpenAI ChatCompletion ile niyet çözümle
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # ya da kendi fine-tuned modelin varsa onun ID'si
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an assistant that extracts hotel-related intent from user messages. "
                        "You must respond ONLY with a JSON object like:\n"
                        "{\"intent\": \"search_hotel\"|\"book_hotel\", \"parameters\": {...}}"
                    )
                },
                {"role": "user", "content": user_message}
            ]
        )

        content = response.choices[0].message["content"]
        return jsonify({"intent_result": content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=True)
