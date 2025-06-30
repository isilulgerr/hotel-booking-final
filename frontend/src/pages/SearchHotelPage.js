import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 👈 yönlendirme için eklendi

function SearchHotelPage() {
    const [message, setMessage] = useState("");
    const [chatResponse, setChatResponse] = useState(null);

    const [city, setCity] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [people, setPeople] = useState(1);
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate(); // 👈 initialize

    const convertToIso = (dateStr) => {
        if (!dateStr.includes(".")) return dateStr;
        const [day, month, year] = dateStr.split(".");
        return `${year}-${month}-${day}`;
    };

    const handleChatSubmit = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:5000/gateway/message", {
                message,
            });
            setChatResponse(res.data);
        } catch (err) {
            console.error("Chatbot error:", err);
            setChatResponse({ error: "Something went wrong." });
        }
    };

    const handleManualSearch = async () => {
        try {
            const formattedCheckIn = convertToIso(checkIn);
            const formattedCheckOut = convertToIso(checkOut);

            const res = await axios.get("http://127.0.0.1:5000/hotels/search", {
                params: {
                    city,
                    check_in: formattedCheckIn,
                    check_out: formattedCheckOut,
                    people,
                },
            });
            console.log("🎯 BACKEND response:", res.data); // 🔍 logla

            console.log("🔍 Search Results:", res.data.results);
            setSearchResults(res.data.results);
            res.data.results.forEach(room => {
                console.log("🔥 Room Object:", room); // Tüm oda verisini logla
                if (!room.hotel_name) {
                    console.error("❌ hotel_name is missing in room:", room.room_id);
                }
            });


        } catch (err) {
            console.error("Manual search error:", err);
            setSearchResults([]);
        }
    };

    // SearchHotelPage.js içinde:
    const goToHotelDetail = (hotelName) => {
        if (!hotelName) {
            console.error("🚨 hotelName is undefined!");
            return;
        }
        // 🔥 encodeURIComponent ile boşlukları %20'ye çevirin:
        const encodedName = encodeURIComponent(hotelName);
        console.log("Encoded hotelName:", encodedName); // "Ocean%20Breeze%20Hotel" çıktısı almalısınız
        navigate(`/hotel/${encodedName}`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Hotel Finder 🤖</h1>

            {/* 🧠 Chatbot alanı */}
            <input
                type="text"
                placeholder="e.g. I want a hotel in Rome from July 15 to July 18..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleChatSubmit}>Search</button>
            <div>
                <pre>{JSON.stringify(chatResponse, null, 2)}</pre>
            </div>

            <hr />

            {/* 🧭 Manuel Arama alanı */}
            <h2>🔍 Manual Hotel Search</h2>
            <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <input
                type="text"
                placeholder="Check-In (e.g. 05.08.2025)"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
            />
            <input
                type="text"
                placeholder="Check-Out (e.g. 12.08.2025)"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
            />
            <input
                type="number"
                placeholder="People"
                value={people}
                min={1}
                onChange={(e) => setPeople(e.target.value)}
            />
            <button onClick={handleManualSearch}>Manual Search</button>

            {/* Sonuçlar */}
            <div style={{ marginTop: "20px" }}>
                <h3>Results:</h3>
                {searchResults.length === 0 ? (
                    <p>No matching hotels found.</p>
                ) : (
                    <ul>
                        {searchResults.map((room) => (
                            <li
                                key={room.room_id}
                                onClick={() => {
                                    console.log("📦 room.hotel_name:", room.hotel_name); // 🔍 bunu da ekle
                                    goToHotelDetail(room.hotel_name);
                                }}
                                style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}
                            >
                                <strong>{room.hotel_name}</strong> – {room.city}, {room.district} – {room.price}₺ – Rating: {room.rating}
                            </li>
                        ))}

                    </ul>
                )}
            </div>
        </div>
    );
}

export default SearchHotelPage;
