import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("userToken", res.token);
      onAuth(res.user);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎮 BETTING ARENA
          </h1>
          <p className="text-gray-400">Win Big, Play Smart</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-purple-500 shadow-2xl space-y-6"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Welcome Back!</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-3 rounded-lg font-black text-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}