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

    // Otel detaylarını çek
    useEffect(() => {
        if (!hotelName) {
            setError("Hotel name is missing in URL.");
            return;
        }

        const fetchHotelDetails = async () => {
            setIsLoading(true);
            try {
                // 🔥 ÖNEMLİ: hotelName'i tekrar encode ETMEYİN, zaten encode edilmiş geliyor!
                const res = await axios.get(`http://127.0.0.1:5000/hotel/${hotelName}`);
                console.log("API Response:", res.data);

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

    // Yorumları çek
    const fetchComments = async (roomId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:5000/room-comments/${roomId}`);
            setComments(res.data.comments);
            setAverages(res.data.service_averages);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // Yorum ekle
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

            console.log("Submitting comment:", commentData); // Debug log

            const response = await axios.post("http://127.0.0.1:5000/add-comment", commentData, {
                timeout: 120000, // 2 dakika timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }

            alert("Yorum başarıyla eklendi!");
            // Yorum listesini yenile
            await fetchComments(selectedRoomId);

            // Formu temizle (room_id hariç)
            setNewComment({
                ...newComment,
                user_name: "",
                text: "",
                rating: 5
            });

            alert("Comment added successfully!");
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Error adding comment: " + (err.response?.data?.message || err.message));
        }
    };

    const handleRoomSelect = (roomId) => {
        setSelectedRoomId(roomId);
        setNewComment(prev => ({ ...prev, room_id: roomId }));
        fetchComments(roomId);
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

                            <form onSubmit={handleAddComment} style={{ marginTop: "20px" }}>
                                <h4>✍️ Add Comment</h4>
                                <div style={{ marginBottom: "15px" }}>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={newComment.user_name}
                                        onChange={(e) => setNewComment({ ...newComment, user_name: e.target.value })}
                                        required
                                        style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <select
                                        value={newComment.service_type}
                                        onChange={(e) => setNewComment({ ...newComment, service_type: e.target.value })}
                                        style={{ padding: "8px" }}
                                    >
                                        <option value="room">Room</option>
                                        <option value="service">Service</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="food">Food</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <select
                                        value={newComment.rating}
                                        onChange={(e) => setNewComment({ ...newComment, rating: parseInt(e.target.value) })}
                                        style={{ padding: "8px" }}
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num} Stars</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <textarea
                                        placeholder="Your Comment"
                                        value={newComment.text}
                                        onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                                        required
                                        style={{ padding: "8px", width: "100%", minHeight: "100px" }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
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