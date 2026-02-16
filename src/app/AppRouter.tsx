import { Routes, Route } from "react-router-dom";
import Home from "../features/Home/Home";
import Login from "../features/Login/Login";
import Register from "../features/Login/Register";
import RentalList from "../features/Rental/RentalList";
import PlotterRequest from "../features/Plotter/PlotterRequest";
import PlotterComplete from "../features/Plotter/PlotterComplete";
import MyPage from "../features/MyPage/MyPage";
import AdminDashboard from "../features/Admin/AdminDashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      <Route path="/rental" element={<RentalList />} />
      <Route path="/plotter" element={<PlotterRequest />} />
      <Route path="/plotter/complete" element={<PlotterComplete />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
