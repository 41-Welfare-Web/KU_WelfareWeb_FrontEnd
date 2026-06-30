import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCommonMetadata } from "../services/commonApi";
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

  // 시간 기반 점검 (00:00~05:00)
  const [isInspectionTime, setIsInspectionTime] = useState(checkInspectionTime);
  // 관리자 강제 점검 모드 (DB 설정)
  const [forcedInspection, setForcedInspection] = useState(false);

  // 1분마다 시간 체크
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInspectionTime(checkInspectionTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 강제 점검 모드: 마운트 시 + 1분마다 API 폴링
  useEffect(() => {
    const check = () => {
      getCommonMetadata()
        .then((meta) => setForcedInspection(meta.inspectionMode ?? false))
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const showInspection = (isInspectionTime || forcedInspection) && !isAdmin && !isLoginPage;

  if (showInspection) {
    return <InspectionScreen forcedMode={forcedInspection} />;
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
