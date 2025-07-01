import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function SearchHotelPage() {
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [people, setPeople] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [hotelLocations, setHotelLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState([38.4237, 27.1428]);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());
  const [debugInfo, setDebugInfo] = useState("");

  const navigate = useNavigate();
  const token = "eyJhbGciOi...";
  const isLoggedIn = Boolean(token);
  const LOCATIONIQ_API_KEY = "pk.dba4166d5fe07574a094dcfd17a13f60";

  // Marker icon fix
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

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

  const geocodeWithLocationIQ = async (query) => {
    try {
      console.log(`Geocoding query: ${query}`);
      const response = await axios.get("https://us1.locationiq.com/v1/search.php", {
        params: {
          q: query,
          format: "json",
          key: LOCATIONIQ_API_KEY,
          limit: 1,
          addressdetails: 1,
          normalizecity: 1
        }
      });

      console.log('Geocoding response:', response.data);
      
      if (response.data?.[0]?.lat) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          display_name: response.data[0]?.display_name || query
        };
      }
    } catch (err) {
      console.error("Geocoding error:", {
        query,
        error: err.response?.data || err.message
      });
      return null;
    }
    return null;
  };

  const handleManualSearch = async () => {
    setLoading(true);
    const debugMessages = ["Search started..."];
    setDebugInfo(debugMessages.join('\n'));
    
    try {
      const formattedCheckIn = convertToIso(checkIn);
      const formattedCheckOut = convertToIso(checkOut);
      
      // 1. First fetch hotels from API
      const res = await axios.get("http://127.0.0.1:5000/hotels/search", {
        params: { city, check_in: formattedCheckIn, check_out: formattedCheckOut, people },
      });

      debugMessages.push(`${res.data.results.length} hotels found`);
      setSearchResults(res.data.results);
      console.log('Hotel data:', res.data.results);

      // 2. Get locations for all hotels using LocationIQ
      const locations = await Promise.all(
        res.data.results.map(async (hotel) => {
          try {
            // Try different query formats
            const queryAttempts = [
              `${hotel.hotel_name}, ${hotel.district || hotel.city}, ${hotel.city}, ${hotel.country || 'Turkey'}`,
              `${hotel.hotel_name}, ${hotel.city}, Turkey`,
              `${hotel.hotel_name}, ${hotel.city}`,
              hotel.hotel_name
            ];

            for (const query of queryAttempts) {
              const location = await geocodeWithLocationIQ(query.trim());
              if (location) {
                debugMessages.push(`Found location for ${hotel.hotel_name}: ${location.display_name}`);
                return {
                  id: hotel.room_id,
                  position: [location.lat, location.lon],
                  hotel: hotel
                };
              }
            }

            debugMessages.push(`Failed to locate: ${hotel.hotel_name}`);
            return null;
          } catch (err) {
            debugMessages.push(`Error locating ${hotel.hotel_name}: ${err.message}`);
            return null;
          }
        })
      );

      // Filter valid locations
      const validLocations = locations.filter(loc => loc !== null);
      setHotelLocations(validLocations);
      debugMessages.push(`${validLocations.length} valid locations found`);

      // Set map center
      if (validLocations.length > 0) {
        setMapCenter(validLocations[0].position);
        debugMessages.push(`Map center set to first hotel: ${validLocations[0].position.join(', ')}`);
      } else if (res.data.results.length > 0) {
        // Fallback to city center if no hotel locations found
        try {
          const cityLocation = await geocodeWithLocationIQ(city + ', Turkey');
          if (cityLocation) {
            setMapCenter([cityLocation.lat, cityLocation.lon]);
            debugMessages.push(`Using city center as fallback: ${cityLocation.lat}, ${cityLocation.lon}`);
          } else {
            debugMessages.push(`Failed to locate city center for ${city}`);
          }
        } catch (err) {
          debugMessages.push(`City location error: ${err.message}`);
        }
      }

      setDebugInfo(debugMessages.join('\n'));
      setMapKey(Date.now());
    } catch (err) {
      console.error("Search error:", err);
      setDebugInfo(`Error: ${err.message}\n${err.stack}`);
      setSearchResults([]);
      setHotelLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const goToHotelDetail = (hotelName) => {
    navigate(`/hotel/${encodeURIComponent(hotelName)}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Global Hotel Finder 🌍</h1>

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="e.g. Hilton Paris or Tokyo" 
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
          placeholder="City/Country/Hotel (e.g. New York)" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "8px", flex: 1 }}
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
            border: "none",
            borderRadius: "4px"
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
          <>
            <p>{searchResults.length} hotels found ({hotelLocations.length} with location data)</p>
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
                    <div>{room.city}, {room.country}</div>
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
                    {!hotelLocations.some(loc => loc.id === room.room_id) && (
                      <div style={{ color: "orange", fontSize: "0.8em" }}>
                        Location data not available
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* MAP SECTION */}
      <div style={{ marginTop: "40px" }}>
        <h3>📍 Hotel Locations</h3>
        <div 
          style={{ 
            height: "500px", 
            width: "100%", 
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            zIndex: 0
          }}
        >
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", position: "relative" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {hotelLocations.map(({id, position, hotel}) => (
              <Marker key={`marker-${id}`} position={position}>
                <Popup>
                  <strong>{hotel.hotel_name}</strong><br />
                  {hotel.city}, {hotel.country}<br />
                  Price: {hotel.price}₺<br />
                  Rating: {hotel.rating}/5
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div style={{ marginTop: "10px", color: "#666", fontSize: "0.9em" }}>
          {hotelLocations.length > 0 ? (
            <span>Showing {hotelLocations.length} hotel locations on map</span>
          ) : searchResults.length > 0 ? (
            <span>No location data available for found hotels</span>
          ) : null}
        </div>

        <button 
          onClick={() => setMapKey(Date.now())}
          style={{
            marginTop: "10px",
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Refresh Map
        </button>
      </div>

      {/* DEBUG INFO */}
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
        <p><strong>Total Hotels:</strong> {searchResults.length}</p>
        <p><strong>Last Search:</strong> {city || 'None'}</p>
        <div style={{ 
          marginTop: "10px",
          padding: "10px",
          background: "#eee",
          borderRadius: "4px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {debugInfo || "No debug information yet"}
        </div>
        <button 
          onClick={() => console.log({
            hotelLocations,
            searchResults,
            mapCenter
          })}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px"
          }}
        >
          Show Data in Console
        </button>
      </div>
    </div>
  );
}

export default SearchHotelPage;