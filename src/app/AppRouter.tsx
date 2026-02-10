import { Routes, Route } from "react-router-dom";
import Home from "../features/Home/Home";
import Login from "../features/Login/Login";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
