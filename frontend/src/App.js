import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchHotelPage from "./pages/SearchHotelPage";
import AdminPanel from "./pages/AdminPanel";
import HotelDetailPage from "./pages/HotelDetailPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchHotelPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/hotel/:hotelName" element={<HotelDetailPage />} />
      </Routes>
    </Router>
  );
}


export default App;
