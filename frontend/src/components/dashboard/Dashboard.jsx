import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      setWallet(res.data.wallet?.tokens || 0);
    } catch (err) {
      toast.error("Failed to load user data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    onLogout();
    navigate("/login");
  };

  const games = [
    { name: "Color Trading", path: "/color-trading", emoji: "🎨", color: "bg-green-600" },
    { name: "Aviator", path: "/aviator", emoji: "✈️", color: "bg-blue-600" },
    { name: "Chicken Road", path: "/chicken-road", emoji: "🐔", color: "bg-yellow-600" },
    { name: "Big Daddy", path: "/big-daddy", emoji: "🎰", color: "bg-purple-600" },
    { name: "Casino", path: "/casino", emoji: "🎲", color: "bg-red-600" },
    { name: "Rummy", path: "/rummy", emoji: "🃏", color: "bg-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎮 Betting Arena</h1>
            {user && <p className="text-gray-400">Welcome, {user.username}!</p>}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Balance</p>
              <p className="text-2xl font-bold text-yellow-500">{wallet} 💎</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-8">
          <Link
            to="/deposit"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold transition"
          >
            💰 Deposit
          </Link>
          <Link
            to="/withdraw"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition"
          >
            🏦 Withdraw
          </Link>
          <Link
            to="/history"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold transition"
          >
            📊 History
          </Link>
          <Link
            to="/support"
            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded font-semibold transition"
          >
            ❓ Support
          </Link>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🎯 Available Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.path}
                to={game.path}
                className={`${game.color} hover:shadow-lg transform hover:scale-105 transition p-6 rounded-lg text-center font-bold text-lg`}
              >
                <div className="text-4xl mb-2">{game.emoji}</div>
                {game.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📈 Recent Bets</h3>
          <p className="text-gray-400">No recent bets yet. Start playing!</p>
        </div>
      </div>
    </div>
  );
}
