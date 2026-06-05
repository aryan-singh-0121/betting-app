import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function Casino() {
  const [balance, setBalance] = useState(0);
  const [spin, setSpin] = useState(false);
  const [result, setResult] = useState(null);
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await axios.get("/wallet/balance");
      setBalance(res.data.tokens);
    } catch (err) {
      toast.error("Failed to load balance");
    }
  };

  const handleSpin = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setSpin(true);
    try {
      const res = await axios.post("/games/bet", { gameType: "CASINO", amount });
      setTimeout(() => {
        setResult(res.result);
        setBalance(balance - amount + res.winnings);
        setSpin(false);
        if (res.winnings > 0) {
          toast.success(`You won ₹${res.winnings}!`);
        } else {
          toast.error("Better luck next time!");
        }
      }, 2000);
    } catch (err) {
      setSpin(false);
      toast.error("Spin failed");
    }
  };

  const reels = ["🍎", "🍊", "🍋", "🍌", "⭐", "💎"];
  const displayResult = result ? [result[0], result[1], result[2]] : ["?", "?", "?"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">🎰 Slot Machine</h1>
        
        <div className="bg-gray-800 rounded-2xl p-8 border border-red-500">
          <div className="text-center mb-8">
            <p className="text-gray-300 text-sm">Balance</p>
            <p className="text-4xl font-bold text-red-400">₹{balance}</p>
          </div>

          <div className="flex justify-center gap-4 mb-8 p-8 bg-gray-900 rounded-xl border-2 border-red-500">
            {displayResult.map((item, i) => (
              <div
                key={i}
                className={`text-6xl p-6 bg-red-600 rounded-lg transform transition ${
                  spin ? "animate-bounce" : ""
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Bet Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                disabled={spin}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSpin}
              disabled={spin || amount > balance}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-4 rounded-lg font-black text-lg transition"
            >
              {spin ? "SPINNING..." : "SPIN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}