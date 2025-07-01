FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["gunicorn", "gateway:app", "-b", "0.0.0.0:8000"]
