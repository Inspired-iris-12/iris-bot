import smtplib
import os
import random
import time
import json
import requests
from flask import Flask, request, jsonify,Response,stream_with_context
from flask_cors import CORS
from email.message import EmailMessage
from mistralai import Mistral
import os
import certifi
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)
context = """
# School Information

## Faculty Members
- **Mahesh Sajnani** (Vice Principal)  
  - Responsible for approvals and final decisions on major school events.  
  - 📧 viceprincipal@diyafahschool.com  
  - 📍 Room: Ground Floor [Old Block], Next to Canteen  

- **Malika Menon** (Head of Sixth Form)  
  - 📧 sixthformco@diyafahschool.com  
  - 📍 Room: Second Floor [New Block], Opposite Boys' Washroom  

- **Neetal Koliar** (Deputy Head of Sixth Form)  
  - Member of the GirlUp Club  
  - 📧 neetal.koliar@diyafahschool.com  
  - 📍 Room: Second Floor [New Block], Opposite Boys' Washroom  

- **Sujatha Suresh** (Head of Year 12 & Year 13)  
  - 📧 yearco1213@diyafahschool.com  

- **Rekha Kumar** (Examinations Officer)  
  - Handles registration, re-sitting, and raw marks for board exams (IGCSE, AS-Level, A-Level).  
  - 📧 examofficer@diyafahschool.com  
  - 📍 Room: First Floor [New Block]  

- **Parvez Khan** (STEM Coordinator)  
  - 📧 parvez.khan@diyafahschool.com  
  - 📍 Staff room, next to canteen [Old Block]  

- **Athul Sivadas** (Activities Coordinator)  
  - Oversees all school clubs and competitions.  
  - 📧 athul.sivadas@diyafahschool.com  

- **Rachel Thomas** (Emotional Counsellor)  
  - Provides emotional counseling to students.  
  - 📧 rachel.thomas@diyafahschool.com  
  - 📍 Room: Third Floor [Old Block]  

- **Krupa Gathani** (Career Counsellor)  
  - Advises students on career planning and university applications.  
  - 📧 careercounsellor@diyafahschool.com  
  - 📍 Library [New Block]  

- **Colin D'Costa** (PE Subject Leader)  
  - Responsible for PE and sports events.  
  - 📧 colin.dcosta@diyafahschool.com  
  - 📍 MUGA  

- **Bindu Nanjappa** (PE Teacher)  
  - Assists with sports events and clubs.  
  - 📧 bindu.nanjappa@diyafahschool.com  
  - 📍 MUGA  

---

## Rooms & Facilities
- **Music Rooms** – Room 40 (Next to MUGA [Old Block], Opposite Canteen [Old Block])  
- **Art Rooms** – Room 39 (Next to MUGA [Old Block], Third Floor [Next to Terrace MUGA])  
- **Library** – (3rd Floor [Old Block] Opposite Physics Lab, Ground Floor [New Block] Opposite Clinic)  
- **Media Room** – (2nd Floor End of Hallway [New Block])  
- **Gymnasium** – (2nd Floor End of Hallway [New Block])  
- **Winnie D'Cunha (W.D.) Hall** – (1st Floor End of Hallway, Backstage Entrance to the Right, Visitor Entrances on the Left [New Block])  
- **Gemini (A.V.) Room** – (First Staircase from Gate 4, Right at the Top [Old Block])  
- **Physics Labs** – (3rd Floor [Old Block], Ground Floor [New Block])  
- **Chemistry Labs** – (3rd Floor [Old Block], Ground Floor [New Block])  
- **Biology Labs** – (3rd Floor [Old Block], Ground Floor [New Block])  
- **ICT Labs** – (Primary ICT Lab, Secondary ICT Lab 1st Floor [Old Block], Ground Floor [New Block])  
- **Male Prayer Room** – Next to Canteen, Opposite Reception  
- **Female Prayer Room** – Next to Canteen, Opposite Reception  
- **Classrooms** – [New Block] Rooms 30-37 (First Floor)  

---

## Key Locations
- **Reception Areas** – [Old Block] Gate 1, [New Block] Gate 6 & 7  
- **Clinics** – [Old Block] Ground Floor, [New Block] Ground Floor Opposite Library  
- **Canteens** – [Old Block] Ground Floor Behind MUGA, [New Block] Ground Floor Opposite Boys' Washroom  
- **MUGAs (Multi-Use Game Areas)** – Next to Large Basketball Court, [Terrace MUGA] 3rd Floor, End of Hallway  
- **Bookstore** – [Old Block] Under Staircase  

---

## Resources
- **Counsellor's Office (Rachel Thomas)** – Third Floor [Old Block]  
- **Career Counsellor's Office (Krupa Gathani)** – Library [New Block]  

---

## School Timings
- **Monday to Thursday** – 7:10 AM to 2:30 PM  
- **Friday** – 7:10 AM to 11:50 AM  
- **Stayback Hours** – 2:40 PM to 3:30 PM  

---

## School Clubs
- **Music Club** – Vehan Mathangasinghe (10177@diyafahschool.com)  
  - Focuses on musical collaboration, forming bands, and participating in events.  
- **Chess Club** – (In Progress)  
- **GirlUp** – (Details Pending)  
- **InspirED** – (Details Pending)  
- **Diyafah M.D.** – Vedika Jhunjhunwala (12117@diyafahschool.com)  
  - A club for aspiring healthcare professionals and medical science enthusiasts.  
- **Debate Society** – (Details Pending)  
- **ADMUN** – Robin D'Souza (robin.dsouza@diyafahschool.com)  
  - Diyafah's annual Model United Nations conference.  
- **Annual Athletic Meet** – Colin D'Costa (colin.dcosta@diyafahschool.com)  
  - Includes track events, relay races, performances, and March Pass.  

"""
# Email credentials (store securely in env variables)
EMAIL_ADDRESS = os.getenv("EMAIL")
EMAIL_PASSWORD = os.getenv("PASSWORD")  # Use the Gmail App Password


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
HEADERS = {
    "Accept": "application/json",
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}
# Store OTPs temporarily (use a database or Redis in production)
otp_store = {}

# Mistral AI API configuration
api_key = os.getenv("MISTRAL_API_KEY")
model = "mistral-large-latest"
client = Mistral(api_key=api_key)

def generate_otp():
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))
    


def mail_response(subject,body,sender):
    """Send an email with the OTP."""
    msg = EmailMessage()
    msg.set_content(f"{body}\n\n{sender}")
    msg["Subject"] = f"Recieved {subject}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = EMAIL_ADDRESS

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False



def send_email(to_email, otp):
    """Send an email with the OTP."""
    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}")
    msg["Subject"] = "Your OTP Code"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    otp_store[email] = {"otp": otp, "timestamp": time.time()}  # Store OTP with timestamp

    if send_email(email, otp):
        return jsonify({"message": "OTP sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send email"}), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")

    if not email or not user_otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    # Check if OTP exists
    if email not in otp_store:
        return jsonify({"error": "OTP not found or expired"}), 400

    stored_otp = otp_store[email]["otp"]
    timestamp = otp_store[email]["timestamp"]

    # Optional: Expire OTP after 5 minutes
    if time.time() - timestamp > 300:
        del otp_store[email]  # Remove expired OTP
        return jsonify({"error": "OTP expired"}), 400

    if user_otp == stored_otp:
        del otp_store[email]  # Remove OTP after successful verification
        return jsonify({"message": "OTP verified successfully"}), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 400

# Common function to interact with Mistral AI
"""def query_mistral_ai(user_input, system_prompt):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_input},
    ]
    
    try:
        chat_response = client.chat.complete(
            model=model,
            messages=messages,
            verify="/path/to/cert.pem"
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        print("Error calling Mistral API:", e)
        return None"""
def query_mistral_ai(user_input, system_prompt, stream=False):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ],
        "stream": stream
    }
    print(f"Sending request to Mistral API with input: {user_input}")
    response = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        json=data,
        headers=headers,
        stream=stream
    )
    print(f"Mistral API status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Mistral API error: {response.text}")
        return Response(f"Mistral API error: {response.text}", status=response.status_code)

    if stream:
        def generate():
            print("Starting Mistral stream")
            for line in response.iter_lines():
                if line:
                    decoded = line.decode("utf-8")
               
                    try:
                        # Parse JSON without stripping
                        chunk = json.loads(decoded.replace('data: ', '', 1))  # Remove 'data: ' once
                        content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "") or \
                                 chunk.get("choices", [{}])[0].get("message", {}).get("content", "")
                        if content:
                       
                 
                            yield f"{content}"  # Preserve spaces and newlines
                            time.sleep(0.05)  # Small delay for client compatibility
                    except (json.JSONDecodeError, KeyError, IndexError) as e:
                        print(f"Error processing chunk: {e}")
            print("Mistral stream completed")
        return Response(stream_with_context(generate()), mimetype="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked"
        })
    else:
        result = response.json()["choices"][0]["message"]["content"]
        print(f"Non-streaming result: {result}")
        return result

# **Define routes for idea, concern, feedback, check-idea, and check-concern**
@app.route("/submit-idea", methods=["GET"])
def submit_idea():
    input_text = request.args.get("input")  # Idea submission
    system_prompt = f""""<context>{context}</context>
You are an AI assistant designed to help users generate a detailed outline for a proposal form based on a brief idea they provide. The proposal will be implemented in a high school context. Use uploaded documents, such as school information, to make the response highly specific.

DO NOT HELP STUDENTS WITH HOMEWORK OR ANY OTHER FORM OF ASSISTANCE. YOUR MAIN JOB IS TO EVALUATE IDEAS ONLY.
YOU MUST STRICTLY FOLLOW THE STRUCTURE BELOW WHEN GENERATING A PROPOSAL FORM.

Instructions:

    Title/Name of the Idea:
        Output the heading "Title/Name of the Idea:".
        Output the idea name (e.g., "Chess Club") on the next line.

    Explanation / Benefits:
        Output the heading "Explanation / Benefits:".
        Output the explanation as a single paragraph, covering:
            What the idea is.
            Which year group(s) of students it is for.
            The benefits it will provide to the school and students.

    Objective(s):
        Output the heading "Objective(s):".
        Output the objectives as a bulleted list, with each bullet starting with "- " (e.g., "- To teach students...").

    Process:
        Output the heading "**Process:**".
        For each subheading (e.g., "**Club Formation:**"):
            Output the subheading.
            Output the description as a paragraph.
        Include:
            Where and when it will be implemented in the school (use the provided school documents for details about rooms, classes, and other resources).
            Identify relevant teachers or staff members to reach out to for assistance, including their specific names and roles based on the provided school documents.
            Specify any materials or resources needed for execution, ensuring they are directly tied to the resources available within the school.

Important Notes:
    ENSURE PROPOSAL FORM IS 250-300 WORDS LONG ONLY.
    Ensure all resources and materials align with what is available at the school, as described in the provided documents. Do not reference or create any external or non-existent resources.
    When mentioning teachers or staff, ensure their names, roles, and contact details are accurate and drawn from the provided knowledge. Avoid making up any details.
    For streaming: Output each heading, idea name, paragraph, bullet point, and subheading as a separate chunk to ensure smooth streaming.

Behavioral Style:
    Use friendly and conversational language while keeping the response professional and structured.
    Ensure the output is concise yet detailed enough to guide the user effectively.
    If the input is offensive, inappropriate, or irrelevant, respond with a blank output. THIS IS CRUCIAL AND MUST BE FOLLOWED.
    DO NOT HELP STUDENTS WITH HOMEWORK OR ASSIGNMENTS at all.
    DO NOT ADDRESS MESSAGES ON HOMOPHOBIA, TRANSPHOBIA, OR HOMOSEXUALITY, ANY POLITICAL OR RADICAL OPINIONS."""
    return query_mistral_ai(input_text, system_prompt, stream=True)





   
@app.route("/submit-concern", methods=["POST"])
def submit_concern():
    data = request.get_json()
    input_text = data.get("input")  # Concern submission
    system_prompt = f"""<context>{context}</context>\nYou are a supportive and empathetic assistant providing concise responses to students who express concerns. Each response should be warm, understanding. RESPONSES SHOULD BE WITHIN 50-100 WORDS, DO NOT USE BULLET POINTS.
        Only respond to concerns and issues, do not help students with homework, you are only meant to provide therapy, and care, nothing more than that. Respond with an appropriate message in this case.
        
        For each concern:
        1. Make sure to validate their concerns before offering any kind of consolation, e.g. "Losing a parent is a deeply tragic event, so you're completely justified in feeling this way."
        2. Provide gentle encouragement or practical advice tailored to the issue.
        - Always offer help and support, and don't give responses like 'I cannot provide you with assistance in harming yourself. If you are having thoughts of self-harm, please seek help from a mental health professional or crisis hotline. Is there anything else I can help you with?', but instead, 'Harming yourself is never the answer, you mean a lot and are worthy of love and care.'
        - Ensure all responses are specific to the school's context. For example, if suggesting reaching out to someone, use the specific names, roles, and details of faculty or counselors provided in the school documents. Do not make up or generalize names or resources.
        - When recommending resources, prioritize those available within the school and avoid external ones unless explicitly provided in the knowledge base.
        
        **Important Notes:**
        - DO NOT TALK ABOUT HARMING YOURSELF, AND SUICIDE UNTIL THE USER EXPLICITLY MENTIONS IT
        - Only provide the hotline numbers **IF CONCERNS relate to ANXIETY ATTACKS, PANIC ATTACKS, SUICIDAL THOUGHTS, or SELF-HARM** once in the first message, or if the user specifically asks for them. Do not repeatedly provide the hotline numbers in every message.
        - DO NOT HELP STUDENTS WITH HOMEWORK, OR ASSIGNMENTS at all.
        - DO NOT ADRESS MESSAGES ON HOMOPHOBIA, TRANSPHOBIA, OR HOMOSEXUALITY, ANY POLITICAL OR RADICAL OPINIONS."""

    return query_mistral_ai(input_text, system_prompt, stream=True)

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    def generate():
        # Example: stream feedback processing
        yield 'data: Thank you for your feedback!\n\n'
        # Add more yields as needed for streaming
    return Response(generate(), mimetype='text/event-stream')

@app.route("/check-idea", methods=["POST"])
def check_idea():

    data = request.get_json()
    input_text = data.get("input")  # Check idea validity
    print(data)
    system_prompt = """You are an AI assistant tasked with assessing user satisfaction. Analyze the user's message to determine if they are **satisfied** or **willing to share** the proposal form.  
- If satisfied or willing to share, respond with: **yes**  
- Otherwise, respond with: **no**  
Reply with **only** `yes` or `no`, without punctuation or explanation."""
    result = query_mistral_ai(input_text, system_prompt,False)
    if result:
        return jsonify({"text": result})
    else:
        return jsonify({"error": "Failed to get a response from Mistral AI"}), 500

@app.route("/check-concern", methods=["POST"])
def check_concern():
    data = request.get_json()
    input_text = data.get("input")  # Check concern validity
    system_prompt = """Determine if the user wants to give an idea or share feedback, some signals to indicate include:
        - The user explicitly says they are 'done,' 'finished,' or 'ready' to move on.
        - They ask about starting a 'give feedback,' 'another concern,' or 'share an idea.'
        - They use phrases like 'that's it,' 'submit this,' or 'add another.'
        - They use phrases like 'that's it,' 'I feel better' or 'Thank you.'
        - The user wants to end the conversation uses phrases like 'bye', 'goodbye', 'see you next time'
        
        IF ANY SUCH SIGNALS ARE DETECTED IT IS IMPORTANT U ONLY RESPOND WITH 'yes' IN LOWERCASE AND NO PUNCCTUATION.
        
        ANY OTHER SIGNAL WHERE THE USER STILL IS SHARING THEIR CONCERN OR WANTS TO CONINUE THE CONVERSATION, GENERATE A RESPONSE 'NO'"""

    result = query_mistral_ai(input_text, system_prompt,False)
    if result:
        return jsonify({"text": result})
    else:
        return jsonify({"error": "Failed to get a response from Mistral AI"}), 500
    

@app.route("/share-idea", methods=["POST"])
def share_idea():
    try:
        data = request.json
        payload = {"type": "idea", "body": data["idea"], "email": data.get("email", "anonymous@example.com")}
        
        # Still make the request to Supabase
        requests.post(SUPABASE_URL, json=payload, headers=HEADERS)
        mail_response('idea', data["idea"],data.get("email", "anonymous@example.com"))
        # Return a simple success response
        return jsonify({
            "success": True,
            "message": "Idea shared successfully"
        }), 200
    except Exception as e:
        # Return a simple error response
        return jsonify({
            "success": False,
            "message": "Error processing your request"
        }), 500
    
    
@app.route("/share-concern", methods=["POST"])
def share_concern():
    try:
        data = request.json
        payload = {"type": "concern", "body": data["concern"], "email": data.get("email", "anonymous@example.com")}
        requests.post(SUPABASE_URL, json=payload, headers=HEADERS)
        mail_response('concern', data["concern"],data.get("email", "anonymous@example.com"))
        return jsonify({
                "success": True,
                "message": "Idea shared successfully"
            }), 200
    except Exception as e:
        # Return a simple error response
        return jsonify({
            "success": False,
            "message": "Error processing your request"
        }), 500
    

@app.route("/share-feedback", methods=["POST"])
def share_feedback():
    try:
        data = request.json
        payload = {"type": "feedback", "body": data["feedback"], "email": data.get("email", "anonymous@example.com")}
        requests.post(SUPABASE_URL, json=payload, headers=HEADERS)
        mail_response('feedback', data["feedback"],data.get("email", "anonymous@example.com"))
        return jsonify({
                "success": True,
                "message": "Idea shared successfully"
            }), 200
    except Exception as e:
        # Return a simple error response
        return jsonify({
            "success": False,
            "message": "Error processing your request"
        }), 500



@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(debug=True)