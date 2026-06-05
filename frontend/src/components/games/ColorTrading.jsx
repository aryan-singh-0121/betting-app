import React, { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";

export default function ColorTrading() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [selected, setSelected] = useState("GREEN");
  const [amount, setAmount] = useState(100);
  const [history, setHistory] = useState([]);
  const [betPlaced, setBetPlaced] = useState(false);
  const [result, setResult] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    socket.connect();
    loadBalance();

    socket.on("color-timer", (data) => {
      setTimeLeft(data.timeLeft);
      setBetPlaced(false);
    });

    socket.on("color-result", (data) => {
      setResult(data.result);
      setHistory((h) => [data.result, ...h.slice(0, 9)]);
      toast.success(`Result: ${data.result.color} (${data.result.number})`);
      setTimeout(() => setResult(null), 3000);
    });

    return () => socket.disconnect();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await axios.get("/wallet/balance");
      setUserBalance(res.data.tokens);
    } catch (err) {
      toast.error("Failed to load balance");
    }
  };

  const placeBet = async () => {
    if (amount > userBalance) {
      toast.error("Insufficient balance!");
      return;
    }
    try {
      await axios.post("/games/bet", { gameType: "COLOR_TRADING", prediction: selected, amount });
      setBetPlaced(true);
      setUserBalance(userBalance - amount);
      toast.success("Bet Placed! ✅");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bet placement failed");
    }
  };

  const resultColor = result?.color === "GREEN" ? "bg-green-600" : result?.color === "RED" ? "bg-red-600" : "bg-purple-600";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🎨 Color Trading</h1>

        {/* Game Display */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6 text-center">
          <p className="text-6xl font-bold text-yellow-500 mb-4">⏱️ {timeLeft}s</p>
          <p className="text-gray-400">Place your bet before time runs out!</p>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`${resultColor} rounded-lg p-6 mb-6 text-center text-2xl font-bold`}>
            Result: {result.color} - Number: {result.number}
          </div>
        )}

        {/* Betting Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {["GREEN", "RED", "VIOLET"].map((color) => (
              <button
                key={color}
                onClick={() => setSelected(color)}
                className={`p-4 rounded font-bold text-lg transition ${
                  selected === color
                    ? color === "GREEN"
                      ? "bg-green-600 scale-105"
                      : color === "RED"
                      ? "bg-red-600 scale-105"
                      : "bg-purple-600 scale-105"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                disabled={betPlaced || timeLeft < 5}
              >
                {color}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Bet Amount (₹)</label>
            <input
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              disabled={betPlaced}
              className="w-full px-4 py-2 bg-gray-700 rounded text-white disabled:opacity-50"
            />
          </div>

          <div className="mb-6 text-sm">
            <p className="text-gray-400">Balance: <span className="text-yellow-500 font-bold">{userBalance} 💎</span></p>
            <p className="text-gray-400">Potential Win: <span className="text-green-500 font-bold">{amount * 2.5} 💎</span></p>
          </div>

          <button
            onClick={placeBet}
            disabled={betPlaced || timeLeft < 5 || amount > userBalance}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 py-3 rounded font-bold text-lg transition"
          >
            {betPlaced ? "✅ Bet Placed" : "Place Bet"}
          </button>
        </div>

        {/* History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Game History</h2>
          <div className="grid grid-cols-5 gap-2">
            {history.map((item, i) => (
              <div
                key={i}
                className={`p-2 rounded text-center text-sm font-bold ${
                  item.color === "GREEN" ? "bg-green-600" : item.color === "RED" ? "bg-red-600" : "bg-purple-600"
                }`}
              >
                {item.number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
