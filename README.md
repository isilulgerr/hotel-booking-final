# 🏨 Hotel Booking System – AI Enhanced

This is a hotel booking web application that allows users to:

- 🔍 Search for available hotel rooms  
- 💬 View and leave comments  
- 🛎️ Book rooms with JWT-based discounts  
- 🤖 Interact with an AI assistant for natural language queries  

An **admin panel** is also included for adding/updating hotel room information.

---

## 🚀 Final Deployment Links

| Component     | URL |
|---------------|-----|
| 🌐 Frontend    | http://localhost:3000 *(local)* |
| 🔗 Gateway API | [https://gateway-final.onrender.com](https://gateway-final.onrender.com) |
| 🤖 AI Agent    | [https://agent-service-v59b.onrender.com](https://agent-service-v59b.onrender.com) |

✅ *All frontend API calls are routed through the Gateway for proper orchestration.*

---

## 🧠 Project Design

This project is **modular** and follows a **service-oriented architecture (SoA)**:

- **Frontend**: React + React Router + Axios + Leaflet  
- **Gateway (API Aggregator)**: Flask-based router between services  
- **AI Agent Service**: Extracts hotel-related intent using OpenAI  
- **Admin, Booking, Search, Comment Services**: Flask-based REST APIs  
- **Database**: PostgreSQL via Render  
- **Comments DB**: Firebase Firestore (NoSQL)

---

## 📌 Assumptions

- 👤 There is only one admin user: `admin` / `1234`  
- 🧠 All AI interactions return structured JSON (e.g., `{ intent, city, check_in, ... }`)  
- 🏨 Hotel names are unique; each room belongs to one hotel  
- 🔐 JWT tokens are stored in `localStorage` and sent with each request  

---

## 🧱 Data Models (Simplified ER Diagram)

ROOM {
  int room_id PK
  string hotel_name FK
  int capacity
  float price
  date available_from
  date available_to
  string amenities
}

BOOKING {
  int booking_id PK
  int room_id FK
  string user_name
  int people
  date check_in
  date check_out
}

COMMENT {
  string comment_id PK
  int room_id FK
  string user_name
  int rating
  string text
  string service_type
  datetime created_at
}

☝️ Comments are stored in Firestore, not PostgreSQL.

---

## ⚠️ Issues Encountered

- ❌ **net::ERR_CONTENT_DECODING_FAILED**  
  → Resolved by removing the `"Accept-Encoding"` header from client requests.

- 🧠 **Incorrect AI intent parsing**  
  → Improved prompt formatting and added fallback logic for robustness.

- 📉 **LocationIQ rate limits**  
  → Implemented fallback geocoding using only the city name when hotel-level geocoding fails.

- 🔄 **Firebase comment integration**  
  → Required handling Firestore with `async/await` and refactoring component logic for comment sync.

---

## 🎬 Project Demo Video

📽️ **Watch the demo here:** [Click to Watch](https://www.youtube.com/watch?v=your-demo-link)

> *(Replace with your actual video URL)*

---

## 👩‍💻 Developed By

**Işıl Ülger**  
Software Engineering Student  
**Course:** SE4458 – Software Architecture Final Project  
**Instructor:** Barış Ceyhan

---
