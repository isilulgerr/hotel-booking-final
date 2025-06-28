# 1. Temel Python imajı
FROM python:3.11-slim

# 2. Çalışma dizinini oluştur
WORKDIR /app

# 3. Gerekli dosyaları kopyala
COPY requirements.txt .

# 4. Bağımlılıkları kur
RUN pip install --no-cache-dir -r requirements.txt

# 5. Uygulama dosyalarını kopyala
COPY . .

# 6. Ortam değişkenlerini ayarla (gerekirse)
ENV FLASK_APP=app
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production

# 7. Portu aç
EXPOSE 5000

# 8. Uygulamayı başlat
CMD ["flask", "run"]
