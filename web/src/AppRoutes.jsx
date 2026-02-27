import { Routes, Route } from "react-router-dom";
import App from "./App";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import DashboardHome from "./dashboard/DashboardHome";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<DashboardHome />} />
    </Routes>
  );
}