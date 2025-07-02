# app.py

from flask import Flask
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv
import pika
import json
import sys
from threading import Thread

# Gerekli yollar
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import check_hotel_capacities, send_reservation_notification

# .env yükle
load_dotenv()

# Flask App
app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return {"status": "ok"}

# 🕓 GECELİK OTOMATİK GÖREV
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_hotel_capacities, trigger="interval", hours=24)
scheduler.start()

# 📨 RABBITMQ DINLEYICI
def start_rabbitmq_listener():
    try:
        rabbitmq_url = os.getenv("RABBITMQ_URL")
        print(f"🔗 Connecting to RabbitMQ: {rabbitmq_url}")
        params = pika.URLParameters(rabbitmq_url)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue='reservation_queue', durable=True)

        def callback(ch, method, properties, body):
            data = json.loads(body)
            print("📥 Received message:", data)
            send_reservation_notification(data)

        channel.basic_consume(queue='reservation_queue', on_message_callback=callback, auto_ack=True)
        print("🐇 RabbitMQ listener started.")
        channel.start_consuming()
    
    except Exception as e:
        print("❌ RabbitMQ connection failed:", str(e))


    params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue='reservation_queue', durable=True)

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body)
            send_reservation_notification(data)
        except Exception as e:
            print(f"❌ Error handling reservation: {e}")

    channel.basic_consume(queue='reservation_queue', on_message_callback=callback, auto_ack=True)
    print("📡 RabbitMQ listener started.")
    channel.start_consuming()

# 🔥 Uygulama Başlat
if __name__ == "__main__":
    Thread(target=start_rabbitmq_listener).start()
    app.run(debug=True, use_reloader=False)
