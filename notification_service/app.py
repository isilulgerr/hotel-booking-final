from flask import Flask
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv
import pika
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils import check_hotel_capacities, send_reservation_notification

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/health")
def health():
    return {"status": "ok"}

# 🕓 Scheduler: Capacity kontrolü
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_hotel_capacities, trigger="interval", hours=24)
scheduler.start()

# 🛎️ RabbitMQ Dinleyici (arka planda)
def start_rabbitmq_listener():
    rabbitmq_url = os.getenv("RABBITMQ_URL")
    params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue='reservation_queue', durable=True)

    def callback(ch, method, properties, body):
        data = json.loads(body)
        send_reservation_notification(data)

    channel.basic_consume(queue='reservation_queue', on_message_callback=callback, auto_ack=True)
    print("RabbitMQ listener started.")
    channel.start_consuming()

if __name__ == "__main__":
    from threading import Thread
    Thread(target=start_rabbitmq_listener).start()
    app.run(debug=True, use_reloader=False)  # reloader=False şart çünkü Thread çakışır
