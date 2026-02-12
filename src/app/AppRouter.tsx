import { Routes, Route } from "react-router-dom";
import Home from "../features/Home/Home";
import Login from "../features/Login/Login";
import Register from "../features/Login/Register";
import RentalList from "../features/Rental/RentalList";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      <Route path="/rental" element={<RentalList />} />
    </Routes>
  );
}
