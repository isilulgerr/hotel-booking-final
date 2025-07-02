🏨 Hotel Booking System – AI Enhanced
This is a hotel booking web application that allows users to:

🔍 Search for available hotel rooms

💬 View and leave comments

🛎️ Book rooms with JWT-based discounts

🤖 Interact with an AI assistant for natural language queries

An admin panel is also included for adding/updating hotel room information.

🚀 Final Deployment Links
Component	URL
🌐 Frontend	http://localhost:3000
🔗 Gateway API	https://gateway-final.onrender.com
🤖 AI Agent	https://agent-service-v59b.onrender.com

✅ All frontend API calls are routed through the Gateway for proper orchestration.

🧠 Project Design
This project is modular and follows a service-oriented architecture (SoA):

Frontend: React + React Router + Axios + Leaflet

Gateway (API Aggregator): Flask; routes and coordinates calls between services

AI Agent Service: Extracts intent and parameters from user messages

Admin, Booking, Search, Comment Services: REST APIs built with Flask

Database: PostgreSQL (via Render)

Comments DB: Firebase Firestore (NoSQL)

📌 Assumptions
There is only one admin user: admin / 1234

All AI interactions return structured JSON like { intent, city, check_in, ... }

Each room belongs to one hotel; hotel names are unique

JWT tokens are stored in localStorage and automatically attached to requests

🧱 Data Models (Simplified ER Diagram)

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

⚠️ Issues Encountered
net::ERR_CONTENT_DECODING_FAILED error from Render due to gzip decoding → Solved by removing invalid headers

AI service sometimes returned incorrect intents → Mitigated with better prompt formatting

LocationIQ rate limits occasionally interfered with geocoding → Implemented fallback logic

Firestore integration in frontend required async/await wrapper fixes

🎬 Project Demo Video 
📽️ Click here to watch the demo

👩‍💻 Developed By
Işıl Ülger – Software Engineering Student
Course: SE4458 – Software Architecture Final Project
Instructor: Barış Ceyhan