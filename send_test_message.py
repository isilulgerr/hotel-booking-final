# send_test_message.py
import pika
import json

# RabbitMQ bağlantı adresi
rabbitmq_url = "amqps://lucwketo:iVnLEv_G8V1bKoy2wlmE0ivTc1OlMv88@seal.lmq.cloudamqp.com/lucwketo"
params = pika.URLParameters(rabbitmq_url)
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue='reservation_queue', durable=True)

# Simülasyon: Booking mesajı
message = {
    "user_email": "test@example.com",
    "hotel_name": "Demo Hotel",
    "check_in_date": "2025-07-20",
    "check_out_date": "2025-07-25",
    "people": 2
}

channel.basic_publish(
    exchange='',
    routing_key='reservation_queue',
    body=json.dumps(message),
    properties=pika.BasicProperties(
        delivery_mode=2,  # persistent
    )
)

print("📤 Sent test reservation.")
connection.close()
