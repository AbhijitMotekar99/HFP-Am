from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize Gemini API
API_KEY = os.getenv("API_KEY")
genai.configure(api_key=API_KEY)

# Create a Flask Blueprint
chatbot_bp = Blueprint('chatbot', __name__)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-2.0-flash')

# List of heart-related keywords
HEART_RELATED_KEYWORDS = [
    "heart", "cardiac", "cardiovascular", "cholesterol", "blood pressure",
    "heart attack", "heart failure", "hypertension", "arrhythmia", "angina",
    "atherosclerosis", "myocardial infarction", "stroke", "heart disease",
    "heart health", "heart rate", "heartbeat", "palpitations", "edema",
    "shortness of breath", "chest pain", "cardiomyopathy", "heart valve",
    "coronary artery", "heart surgery", "heart transplant", "pacemaker",
    "defibrillator", "heart monitor", "echocardiogram", "electrocardiogram",
    "stress test", "cardiac arrest", "heart rhythm", "heart murmur",
    "heartburn", "heart block", "heart inflammation", "heart failure symptoms",
    "heart attack symptoms", "heart health tips", "heart healthy diet",
    "heart exercise", "heart medication", "heart risk factors", "heart prevention"
]

def is_heart_related(user_message):
    """
    Check if the user's message is related to heart health.
    """
    user_message = user_message.lower()
    for keyword in HEART_RELATED_KEYWORDS:
        if keyword in user_message:
            return True
    return False

def format_response(response_text):
    """
    Format the response text to apply markdown-style bold formatting.
    """
    # Split the response into paragraphs
    paragraphs = response_text.split("\n\n")

    # Format each paragraph
    formatted_response = ""
    for paragraph in paragraphs:
        if paragraph.strip():  # Skip empty paragraphs
            # Apply bold formatting for text enclosed in **
            formatted_paragraph = ""
            parts = paragraph.split("**")
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Odd indices are inside **
                    formatted_paragraph += f"<strong>{part}</strong>"
                else:  # Even indices are outside **
                    formatted_paragraph += part
            formatted_response += f"<p>{formatted_paragraph}</p>"

    return formatted_response

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'reply': 'Please provide a valid message.'}), 400

    # Check if the message is heart-related
    if not is_heart_related(user_message):
        return jsonify({'reply': "I'm here to help with heart health. Please ask me about heart-related topics."})

    try:
        # Generate a response using Gemini
        print(f"Sending message to Gemini: {user_message}")
        response = model.generate_content(user_message)
        print(f"Received response from Gemini: {response.text}")

        # Format the response
        formatted_reply = format_response(response.text)

        return jsonify({'reply': formatted_reply})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'reply': 'Sorry, I could not process your request. Please try again.'}), 500