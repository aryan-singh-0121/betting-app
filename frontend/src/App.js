import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "./api/axiosInstance";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import ColorTrading from "./components/games/ColorTrading";
import Aviator from "./components/games/Aviator";
import AdminPanel from "./components/admin/AdminPanel";
import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    const savedAdmin = localStorage.getItem("adminToken");
    if (savedUser) setUser({ authenticated: true });
    if (savedAdmin) setAdmin({ authenticated: true });
  }, []);

  const handleUserAuth = (userData) => {
    setUser(userData);
  };

  const handleAdminAuth = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    setUser(null);
    setAdmin(null);
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* User Routes */}
        <Route path="/login" element={!user ? <Login onAuth={handleUserAuth} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register onAuth={handleUserAuth} /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/color-trading" element={user ? <ColorTrading /> : <Navigate to="/login" />} />
        <Route path="/aviator" element={user ? <Aviator /> : <Navigate to="/login" />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={!admin ? <AdminLogin onAuth={handleAdminAuth} /> : <Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={admin ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminLogin({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/admin-login", { username, password, passcode });
      localStorage.setItem("adminToken", res.data.token);
      onAuth(res.data.admin);
    } catch (err) {
      alert("Admin login failed");
    }
  };

  return (
    <form onSubmit={handleAdminLogin} className="space-y-4 bg-gray-800 p-8 rounded max-w-sm mx-auto mt-16">
      <h2 className="font-bold text-xl mb-4 text-center">🛡️ Admin Login</h2>
      <input className="w-full px-3 py-2 bg-gray-900 rounded text-white" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full px-3 py-2 bg-gray-900 rounded text-white" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <input className="w-full px-3 py-2 bg-gray-900 rounded text-white" type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
      <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-bold">Admin Login</button>
    </form>
  );
}

export default App;
