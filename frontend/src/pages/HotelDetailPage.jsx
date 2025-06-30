import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function HotelDetailPage() {
    const { hotelName } = useParams();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [averages, setAverages] = useState({});
    const [newComment, setNewComment] = useState({
        room_id: "",
        user_name: "",
        text: "",
        rating: 5,
        service_type: "room"
    });
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    useEffect(() => {
        if (!hotelName) {
            setError("Hotel name is missing in URL.");
            return;
        }

        const fetchHotelDetails = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`http://127.0.0.1:5000/hotel/${hotelName}`);
                if (!res.data || res.data.length === 0) {
                    setError("No rooms found for this hotel.");
                } else {
                    setRooms(res.data);
                }
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch hotel details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotelDetails();
    }, [hotelName]);

    const fetchComments = async (roomId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:5000/room-comments/${roomId}`);
            setComments(res.data.comments);
            setAverages(res.data.service_averages);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            if (!selectedRoomId) {
                alert("Please select a room first");
                return;
            }

            const commentData = {
                room_id: selectedRoomId,
                user_name: newComment.user_name,
                text: newComment.text,
                rating: newComment.rating,
                service_type: newComment.service_type,
                created_at: new Date().toISOString()
            };

            const response = await axios.post("http://127.0.0.1:5000/add-comment", commentData);
            if (response.data.error) throw new Error(response.data.error);

            alert("Comment added successfully!");
            await fetchComments(selectedRoomId);
            setNewComment({
                ...newComment,
                user_name: "",
                text: "",
                rating: 5
            });
        } catch (err) {
            alert("Error adding comment: " + (err.response?.data?.message || err.message));
        }
    };

    const handleRoomSelect = (roomId) => {
        setSelectedRoomId(roomId);
        setNewComment(prev => ({ ...prev, room_id: roomId }));
        fetchComments(roomId);
    };
    const token = "eyJhb..."; // Replace with actual token
    const bookRoom = async (roomId) => {
        const people = prompt("How many people?");
        const checkIn = prompt("Check in date (YYYY-MM-DD)?");
        const checkOut = prompt("Check out date (YYYY-MM-DD)?");

        if (!people || !checkIn || !checkOut) {
            alert("Please fill the blank spaces!");
            return;
        }

        try {
            const res = await axios.post("http://127.0.0.1:5000/book-room", {
                room_id: roomId,
                people,
                check_in: checkIn,
                check_out: checkOut
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.booking_id) {
                alert(`✅ The booking is successful! Booking ID: ${res.data.booking_id}`);
            } else if (res.data.error) {
                alert(`❌ ${res.data.error}`);
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("Booking error accured");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>🏨 Hotel: {decodeURIComponent(hotelName)}</h2>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <div>
                    <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
                        <thead>
                            <tr>
                                <th>Room ID</th>
                                <th>City</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Available From</th>
                                <th>Available To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.room_id}>
                                    <td>{room.room_id}</td>
                                    <td>{room.city}</td>
                                    <td>{room.capacity}</td>
                                    <td>{room.price}₺</td>
                                    <td>{room.available_from}</td>
                                    <td>{room.available_to}</td>
                                    <td>
                                        <button onClick={() => handleRoomSelect(room.room_id)}>
                                            {selectedRoomId === room.room_id ? "Show Comments (Selected)" : "Show Comments"}
                                        </button>
                                        <br />
                                        <button onClick={() => bookRoom(room.room_id)}>Book it 🛎️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedRoomId && (
                        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
                            <h3>💬 Comments for Room {selectedRoomId}</h3>

                            {Object.keys(averages).length > 0 && (
                                <div style={{ marginBottom: "20px" }}>
                                    <h4>⭐ Service Averages:</h4>
                                    <ul>
                                        {Object.entries(averages).map(([service, avg]) => (
                                            <li key={service}>{service}: {avg}/5</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{ marginBottom: "20px" }}>
                                {comments.length > 0 ? (
                                    comments.map((comment, index) => (
                                        <div key={index} style={{
                                            borderBottom: "1px solid #eee",
                                            padding: "10px 0",
                                            marginBottom: "10px"
                                        }}>
                                            <strong>{comment.user_name}</strong> ({comment.rating}/5) - {comment.service_type}
                                            <p>{comment.text}</p>
                                            <small>{new Date(comment.created_at).toLocaleString()}</small>
                                        </div>
                                    ))
                                ) : (
                                    <p>No comments yet. Be the first to comment!</p>
                                )}
                            </div>

                            <form onSubmit={handleAddComment}>
                                <h4>✍️ Add Comment</h4>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={newComment.user_name}
                                    onChange={(e) => setNewComment({ ...newComment, user_name: e.target.value })}
                                    required
                                    style={{ padding: "8px", width: "100%", maxWidth: "300px", marginBottom: "10px" }}
                                />
                                <select
                                    value={newComment.service_type}
                                    onChange={(e) => setNewComment({ ...newComment, service_type: e.target.value })}
                                    style={{ padding: "8px", marginBottom: "10px" }}
                                >
                                    <option value="room">Room</option>
                                    <option value="service">Service</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="food">Food</option>
                                </select>
                                <select
                                    value={newComment.rating}
                                    onChange={(e) => setNewComment({ ...newComment, rating: parseInt(e.target.value) })}
                                    style={{ padding: "8px", marginBottom: "10px" }}
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>{num} Stars</option>
                                    ))}
                                </select>
                                <textarea
                                    placeholder="Your Comment"
                                    value={newComment.text}
                                    onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                                    required
                                    style={{ padding: "8px", width: "100%", minHeight: "100px", marginBottom: "10px" }}
                                />
                                <button type="submit" style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}>
                                    Submit Comment
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default HotelDetailPage;
