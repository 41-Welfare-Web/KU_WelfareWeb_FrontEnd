import { Routes, Route } from "react-router-dom";
import Home from "../features/Home/Home";
import Login from "../features/Login/Login";
import Register from "../features/Login/Register";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
    </Routes>
  );
}
