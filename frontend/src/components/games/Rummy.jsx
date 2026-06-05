import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function Rummy() {
  const [balance, setBalance] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
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

  const startGame = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    try {
      const res = await axios.post("/games/bet", { gameType: "RUMMY", amount });
      setGameStarted(true);
      setHand(res.hand);
      setTable(res.table);
      toast.success("Game started!");
    } catch (err) {
      toast.error("Failed to start game");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">🃏 Rummy</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-800 rounded-2xl p-8 border border-green-500">
            <h2 className="text-2xl font-bold mb-6">Game Table</h2>
            <div className="bg-green-700 rounded-lg p-8 mb-6 min-h-40">
              <div className="text-center text-gray-300">
                {table.length === 0 ? "Waiting for cards..." : `Cards: ${table.join(", ")}`}
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-4">Your Hand</h3>
            <div className="bg-gray-900 rounded-lg p-6 flex flex-wrap gap-3">
              {hand.length === 0 ? (
                <p className="text-gray-400">No cards yet</p>
              ) : (
                hand.map((card, i) => (
                  <button
                    key={i}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold border-2 border-blue-400 transition"
                  >
                    {card}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-green-500 h-fit space-y-4">
            <div>
              <p className="text-gray-300 text-sm">Balance</p>
              <p className="text-3xl font-bold text-green-400">₹{balance}</p>
            </div>
            {!gameStarted ? (
              <>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                />
                <button
                  onClick={startGame}
                  disabled={amount > balance}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-lg font-bold transition"
                >
                  Start Game
                </button>
              </>
            ) : (
              <>
                <button className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition">
                  Declare
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition">
                  Drop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}