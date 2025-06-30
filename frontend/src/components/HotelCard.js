import React from "react";

const HotelCard = ({ hotel, onReserve }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }}>
      <h3>{hotel.hotel_name}</h3>
      <p>📍 District: {hotel.district}</p>
      <p>💵 Price: ${hotel.price}</p>
      <p>⭐ Rating: {hotel.rating}</p>
      <p>🛏️ Available: {hotel.available_from} → {hotel.available_to}</p>
      <p>🎯 Amenities: {hotel.amenities.join(", ")}</p>
      <button onClick={onReserve} style={{ marginTop: 10 }}>
        Reserve this hotel
      </button>
    </div>
  );
};

export default HotelCard;
