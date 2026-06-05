import React, { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";

export default function Aviator() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState("waiting"); // waiting, flying, crashed
  const [amount, setAmount] = useState(100);
  const [userBalance, setUserBalance] = useState(0);
  const [betActive, setBetActive] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    socket.connect();
    loadBalance();

    socket.on("aviator-multiplier", (data) => {
      setMultiplier(data.multiplier);
      setGameState("flying");
    });

    socket.on("aviator-crash", (data) => {
      setGameState("crashed");
      toast.error(`Crashed at ${data.multiplier}x!`);
      setHistory((h) => [data.multiplier, ...h.slice(0, 9)]);
      setTimeout(() => {
        setGameState("waiting");
        setMultiplier(1.0);
      }, 3000);
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
      await axios.post("/games/bet", { gameType: "AVIATOR", amount });
      setBetActive(true);
      toast.success("Bet placed! Good luck 🚀");
    } catch (err) {
      toast.error("Bet placement failed");
    }
  };

  const cashOut = async () => {
    try {
      const res = await axios.post("/games/cashout", { gameType: "AVIATOR", multiplier });
      setWinnings(res.data.winnings);
      setBetActive(false);
      setUserBalance(userBalance + res.data.winnings);
      toast.success(`Cashed out! Won: ₹${res.data.winnings}`);
    } catch (err) {
      toast.error("Cashout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">✈️ Aviator</h1>

        {/* Game Display */}
        <div className="bg-gray-800 rounded-lg p-12 mb-6 text-center relative h-64 flex items-center justify-center overflow-hidden">
          <div
            className={`absolute transition-all duration-100 text-6xl ${
              gameState === "flying" ? "animate-pulse" : ""
            } ${gameState === "crashed" ? "text-red-500" : "text-yellow-400"}`}
          >
            ✈️
          </div>
          <div className="text-7xl font-bold ml-20">
            {multiplier.toFixed(2)}
            <span className="text-4xl">x</span>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <p className="text-2xl font-bold">
            {gameState === "waiting"
              ? "🎲 Waiting for next round..."
              : gameState === "flying"
              ? "🚀 Plane is flying!"
              : "💥 Plane Crashed!"}
          </p>
        </div>

        {/* Betting Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Bet Amount (₹)</label>
            <input
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              disabled={betActive}
              className="w-full px-4 py-2 bg-gray-700 rounded text-white disabled:opacity-50"
            />
          </div>

          <div className="mb-6 text-sm">
            <p className="text-gray-400">Balance: <span className="text-yellow-500 font-bold">{userBalance} 💎</span></p>
            {betActive && <p className="text-green-500">Potential Win: ₹{(amount * multiplier).toFixed(2)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={placeBet}
              disabled={betActive || gameState !== "waiting" || amount > userBalance}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded font-bold text-lg transition"
            >
              Place Bet
            </button>
            <button
              onClick={cashOut}
              disabled={!betActive}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded font-bold text-lg transition"
            >
              Cash Out
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Crash History</h2>
          <div className="grid grid-cols-5 gap-2">
            {history.map((crash, i) => (
              <div key={i} className="p-2 rounded text-center text-sm font-bold bg-red-600">
                {crash.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
