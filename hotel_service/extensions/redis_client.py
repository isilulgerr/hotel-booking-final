import redis
import os

redis_url = os.getenv("REDIS_URL")
redis_client = redis.from_url(redis_url, decode_responses=True)
