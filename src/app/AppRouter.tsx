import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Home from "../features/Home/Home";
import WelfareIntro from "../features/Intro/WelfareIntro";
import Login from "../features/Login/Login";
import Register from "../features/Login/Register";
import RentalList from "../features/Rental/RentalList";
import PlotterRequest from "../features/Plotter/PlotterRequest";
import PlotterComplete from "../features/Plotter/PlotterComplete";
import MyPage from "../features/MyPage/MyPage";
import AdminDashboard from "../features/Admin/AdminDashboard";
import FindAccount from "../features/Login/FindAccount";
import RentalCart from "../features/Rental/RentalCart";
import RentalComplete from "../components/Rental/RentalComplete";
import ProtectedAdminRoute from "../components/Admin/ProtectedAdminRoute";
import Partnership from "../features/Partnership/Partnership";
import InspectionScreen from "../features/Inspection/InspectionScreen";

function checkInspectionTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 0 && hour < 5;
}

export default function AppRouter() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";
  const isLoginPage = location.pathname === "/login";

  const [isInspection, setIsInspection] = useState(checkInspectionTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInspection(checkInspectionTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isInspection && !isAdmin && !isLoginPage) {
    return <InspectionScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/welfare" element={<WelfareIntro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/find-account" element={<FindAccount />} />

      <Route path="/rental" element={<RentalList />} />
      <Route path="/rental/cart" element={<RentalCart />} />
      <Route path="/rental/complete" element={<RentalComplete />} />

      <Route path="/plotter" element={<PlotterRequest />} />
      <Route path="/plotter/complete" element={<PlotterComplete />} />

      <Route path="/mypage" element={<MyPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />

      <Route path="/parnership" element={<Partnership />} />
    </Routes>
  );
}
