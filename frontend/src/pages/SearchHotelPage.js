import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker icon fix (MUTLAKA EKLENMELİ)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function SearchHotelPage() {
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [city, setCity] = useState("İzmir"); // Varsayılan şehir İzmir
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [people, setPeople] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [hotelLocations, setHotelLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState([38.4237, 27.1428]); // İzmir koordinatları
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Haritayı yenilemek için
  const [debugInfo, setDebugInfo] = useState(""); // Debug bilgileri

  const navigate = useNavigate();
  const token = "eyJhbGciOi...";
  const isLoggedIn = Boolean(token);

  const convertToIso = (dateStr) => {
    if (!dateStr.includes(".")) return dateStr;
    const [day, month, year] = dateStr.split(".");
    return `${year}-${month}-${day}`;
  };

  const handleChatSubmit = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/gateway/message", { message });
      setChatResponse(res.data);
    } catch (err) {
      console.error("Chatbot error:", err);
      setChatResponse({ error: "Something went wrong." });
    }
  };

  const handleManualSearch = async () => {
    setLoading(true);
    setDebugInfo("Arama başladı...");
    try {
      const formattedCheckIn = convertToIso(checkIn);
      const formattedCheckOut = convertToIso(checkOut);
      
      setDebugInfo(`API isteği gönderiliyor: city=${city}, checkIn=${formattedCheckIn}, checkOut=${formattedCheckOut}`);
      
      const res = await axios.get("http://127.0.0.1:5000/hotels/search", {
        params: { city, check_in: formattedCheckIn, check_out: formattedCheckOut, people },
      });
      
      setDebugInfo(`API yanıtı alındı: ${res.data.results.length} otel bulundu`);
      console.log("API Response:", res.data);
      
      setSearchResults(res.data.results);
      setMapKey(Date.now()); // Haritayı yenile
    } catch (err) {
      console.error("Manual search error:", err);
      setDebugInfo(`Hata oluştu: ${err.message}`);
      setSearchResults([]);
      setHotelLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHotelLocations = async () => {
      const locations = [];
      setDebugInfo("Konum bilgileri alınıyor...");
      
      for (const hotel of searchResults) {
        const query = `${hotel.hotel_name} Otel, ${hotel.district}, ${hotel.city}, Turkey`;
        setDebugInfo(`Nominatim sorgusu: ${query}`);
        
        try {
          const res = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { 
              q: query, 
              format: "json", 
              limit: 1,
              countrycodes: 'tr',
              addressdetails: 1 
            },
          });
          
          console.log("Nominatim response for", query, ":", res.data);
          
          if (res.data?.[0]?.lat) {
            locations.push({
              id: hotel.room_id,
              position: [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)],
              hotel: hotel
            });
            setDebugInfo(`Konum bulundu: ${hotel.hotel_name} - ${res.data[0].lat},${res.data[0].lon}`);
          } else {
            setDebugInfo(`Konum bulunamadı: ${hotel.hotel_name}`);
          }
        } catch (err) {
          console.error(`Konum bulunamadı: ${query}`, err);
          setDebugInfo(`Konum hatası: ${query} - ${err.message}`);
        }
      }
      
      if (locations.length > 0) {
        setHotelLocations(locations);
        setMapCenter(locations[0].position);
        setDebugInfo(`${locations.length} otelin konumu başarıyla alındı`);
      } else {
        // TEST VERİLERİ - SİLİNECEK
        const testLocations = [
          {
            id: 9991,
            position: [38.4192, 27.1287],
            hotel: {
              hotel_name: "TEST Otel 1 (Konak)",
              district: "Konak",
              city: "İzmir",
              price: 500,
              rating: 4.5,
              room_id: 9991
            }
          },
          {
            id: 9992,
            position: [38.4284, 27.1369],
            hotel: {
              hotel_name: "TEST Otel 2 (Alsancak)",
              district: "Alsancak",
              city: "İzmir",
              price: 700,
              rating: 4.8,
              room_id: 9992
            }
          }
        ];
        
        setHotelLocations(testLocations);
        setMapCenter([38.4237, 27.1428]);
        setDebugInfo("Test verileri yüklendi (Nominatim'den veri gelmedi)");
      }
    };

    if (searchResults.length > 0) {
      fetchHotelLocations();
    }
  }, [searchResults]);

  const goToHotelDetail = (hotelName) => {
    navigate(`/hotel/${encodeURIComponent(hotelName)}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Hotel Finder 🤖</h1>

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="e.g. I want a hotel in Izmir..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          style={{ padding: "8px", width: "300px" }}
        />
        <button 
          onClick={handleChatSubmit}
          style={{ padding: "8px 15px", marginLeft: "10px" }}
        >
          Search
        </button>
        {chatResponse && (
          <div style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5" }}>
            <pre>{JSON.stringify(chatResponse, null, 2)}</pre>
          </div>
        )}
      </div>

      <hr />

      <h2>🔍 Manual Hotel Search</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="City (e.g. Izmir)" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input 
          type="text" 
          placeholder="Check-In (e.g. 05.08.2025)" 
          value={checkIn} 
          onChange={(e) => setCheckIn(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input 
          type="text" 
          placeholder="Check-Out (e.g. 12.08.2025)" 
          value={checkOut} 
          onChange={(e) => setCheckOut(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input 
          type="number" 
          placeholder="People" 
          value={people} 
          min={1} 
          onChange={(e) => setPeople(e.target.value)}
          style={{ padding: "8px", width: "80px" }}
        />
        <button 
          onClick={handleManualSearch}
          disabled={loading}
          style={{ 
            padding: "8px 15px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none"
          }}
        >
          {loading ? "Searching..." : "Search Hotels"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Results:</h3>
        {searchResults.length === 0 ? (
          <p>No matching hotels found. Try a different search.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {searchResults.map((room) => {
              const originalPrice = room.price;
              const discountedPrice = (originalPrice * 0.85).toFixed(2);
              return (
                <li 
                  key={room.id} 
                  onClick={() => goToHotelDetail(room.hotel_name)} 
                  style={{ 
                    cursor: "pointer", 
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    ":hover": { backgroundColor: "#f9f9f9" }
                  }}
                >
                  <strong style={{ fontSize: "1.1em" }}>{room.hotel_name}</strong>
                  <div>{room.city}, {room.district}</div>
                  <div style={{ marginTop: "5px" }}>
                    {isLoggedIn ? (
                      <>
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          {discountedPrice}₺ (15% off)
                        </span>
                        <span style={{ color: "gray", textDecoration: "line-through", marginLeft: "10px" }}>
                          {originalPrice}₺
                        </span>
                      </>
                    ) : (
                      <span>{originalPrice}₺</span>
                    )}
                  </div>
                  <div>Rating: {room.rating}/5</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* KESİN ÇALIŞAN HARİTA BÖLÜMÜ */}
      <div style={{ marginTop: "40px" }}>
        <h3>📍 Hotel Locations in {city || 'Selected City'}</h3>
        <div 
          style={{ 
            height: "500px", 
            width: "100%", 
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {hotelLocations.map(({id, position, hotel}) => (
              <Marker key={`marker-${id}`} position={position}>
                <Popup>
                  <strong>{hotel.hotel_name}</strong><br />
                  {hotel.district}, {hotel.city}<br />
                  Price: {hotel.price}₺<br />
                  Rating: {hotel.rating}/5
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div style={{ marginTop: "10px", color: "#666", fontSize: "0.9em" }}>
          {hotelLocations.length > 0 ? (
            <span>Showing {hotelLocations.length} hotel locations in {city}</span>
          ) : searchResults.length > 0 ? (
            <span>Loading hotel locations...</span>
          ) : null}
        </div>
      </div>

      {/* GELİŞMİŞ DEBUG ALANI */}
      <div style={{ 
        marginTop: "20px", 
        padding: "15px", 
        background: "#f5f5f5", 
        borderRadius: "5px",
        fontFamily: "monospace",
        fontSize: "14px"
      }}>
        <h4>Debug Information:</h4>
        <p><strong>Map Center:</strong> {mapCenter.join(", ")}</p>
        <p><strong>Hotel Locations:</strong> {hotelLocations.length} found</p>
        <p><strong>Last Search City:</strong> {city}</p>
        <div style={{ 
          marginTop: "10px",
          padding: "10px",
          background: "#eee",
          borderRadius: "4px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {debugInfo || "Debug bilgisi bekleniyor..."}
        </div>
        <button 
          onClick={() => {
            console.log("Hotel Locations:", hotelLocations);
            console.log("Search Results:", searchResults);
          }}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px"
          }}
        >
          Console.log Data
        </button>
      </div>
    </div>
  );
}

export default SearchHotelPage;