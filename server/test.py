import smtplib
from email.message import EmailMessage

# Your Gmail credentials
EMAIL_ADDRESS = "irisinspired12@gmail.com"
EMAIL_PASSWORD = "jjak zjvb wqfw rzdo"  # Use the app password you generated

def send_email(to_email, subject, body):
    """Send an email using Gmail's SMTP server."""
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    try:
        # Connect to Gmail's SMTP server and send the email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email: {e}")

# Example usage
send_email("yusuff.0279@gmail.com", "Your OTP Code", "Here is your OTP code: 123456")
