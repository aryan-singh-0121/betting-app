import React, { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";

export default function ChickenRoad() {
  const [gameState, setGameState] = useState("playing");
  const [score, setScore] = useState(0);
  const [amount, setAmount] = useState(100);
  const [balance, setBalance] = useState(0);
  const [betActive, setBetActive] = useState(false);
  const [maxDistance, setMaxDistance] = useState(0);

  useEffect(() => {
    loadBalance();
    socket.connect();
    socket.on("chicken-update", (data) => {
      setScore(data.distance);
      if (data.distance > maxDistance) setMaxDistance(data.distance);
    });
    socket.on("chicken-crash", (data) => {
      setGameState("crashed");
      toast.error(`Game Over! Distance: ${data.distance}m`);
      setTimeout(() => setGameState("playing"), 3000);
    });
    return () => socket.disconnect();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await axios.get("/wallet/balance");
      setBalance(res.data.tokens);
    } catch (err) {
      toast.error("Failed to load balance");
    }
  };

  const placeBet = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }
    try {
      await axios.post("/games/bet", { gameType: "CHICKEN_ROAD", amount });
      setBetActive(true);
      setScore(0);
      toast.success("Bet placed!");
    } catch (err) {
      toast.error("Bet placement failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">🐔 Chicken Road</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-8 border border-yellow-500">
            <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden border-2 border-yellow-500">
              <div className="text-center pt-20">
                <p className="text-6xl mb-4">🐔</p>
                <p className="text-4xl font-bold text-yellow-400">{score}m</p>
                <p className="text-gray-400 mt-4">{gameState === "playing" ? "Use arrow keys" : "Game Over!"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-yellow-500 space-y-4">
            <div className="text-right">
              <p className="text-gray-300 text-sm">Balance</p>
              <p className="text-3xl font-bold text-yellow-400">₹{balance}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-semibold mb-2">Bet Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                disabled={betActive}
                className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white disabled:opacity-50"
              />
            </div>
            <button
              onClick={placeBet}
              disabled={betActive || amount > balance}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 py-3 rounded-lg font-bold transition"
            >
              {betActive ? "Playing..." : "Start Game"}
            </button>
            <div className="text-center text-sm text-gray-400">
              <p>Max Distance: {maxDistance}m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}