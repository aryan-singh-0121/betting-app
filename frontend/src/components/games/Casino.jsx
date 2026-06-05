import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Casino() {
  const [balance, setBalance] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [amount, setAmount] = useState(100);
  const [winHistory, setWinHistory] = useState([]);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = () => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      setBalance(user.balance || 0);
    } catch (err) {
      toast.error("Failed to load balance");
    }
  };

  const updateBalance = (newBalance) => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      user.balance = newBalance;
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      const users = JSON.parse(localStorage.getItem("bettingAppUsers") || "[]");
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem("bettingAppUsers", JSON.stringify(users));
      }
      setBalance(newBalance);
    } catch (err) {
      console.error("Error updating balance", err);
    }
  };

  const handleSpin = async () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setSpinning(true);
    updateBalance(balance - amount);

    // Simulate spinning
    setTimeout(() => {
      const reels = ["🍎", "🍊", "🍋", "🍌", "⭐", "💎"];
      const spinResult = [
        reels[Math.floor(Math.random() * reels.length)],
        reels[Math.floor(Math.random() * reels.length)],
        reels[Math.floor(Math.random() * reels.length)],
      ];

      setResult(spinResult);

      // Check if all three match (jackpot)
      const isJackpot = spinResult[0] === spinResult[1] && spinResult[1] === spinResult[2];
      const isWin = spinResult[0] === spinResult[1] || spinResult[1] === spinResult[2];
      const isMatch = spinResult[0] === spinResult[2];

      let winnings = 0;
      if (isJackpot) {
        winnings = amount * 10; // 10x multiplier for jackpot
        toast.success(`🎉 JACKPOT! You won ₹${winnings}!`);
      } else if (isWin) {
        winnings = amount * 2; // 2x multiplier
        toast.success(`You won ₹${winnings}!`);
      } else if (isMatch) {
        winnings = amount * 1.5; // 1.5x multiplier
        toast.success(`Small win! ₹${winnings}!`);
      } else {
        toast.error("Better luck next time!");
      }

      const newBalance = balance - amount + winnings;
      updateBalance(newBalance);

      // Add to history
      const historyEntry = {
        amount,
        result: spinResult.join(""),
        winnings,
        timestamp: new Date().toLocaleTimeString(),
      };
      setWinHistory([historyEntry, ...winHistory.slice(0, 9)]);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">🎰 Slot Machine</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-800 rounded-2xl p-8 border border-red-500">
            <div className="flex justify-center gap-4 mb-8 p-8 bg-gray-900 rounded-xl border-2 border-red-500">
              {(result || ["?", "?", "?"]).map((item, i) => (
                <div
                  key={i}
                  className={`text-8xl p-6 bg-red-600 rounded-lg transform transition ${
                    spinning ? "animate-spin" : ""
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Recent Spins</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {winHistory.length === 0 ? (
                  <p className="text-gray-400">No spins yet</p>
                ) : (
                  winHistory.map((entry, i) => (
                    <div key={i} className="text-sm text-gray-300 flex justify-between p-2 bg-gray-800 rounded">
                      <span>{entry.result} - Bet: ₹{entry.amount}</span>
                      <span className={entry.winnings > 0 ? "text-green-400" : "text-red-400"}>
                        {entry.winnings > 0 ? "+" : "-"}₹{entry.winnings}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-red-500 h-fit space-y-4">
            <div>
              <p className="text-gray-300 text-sm">Balance</p>
              <p className="text-3xl font-bold text-red-400">₹{balance}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bet Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, +e.target.value))}
                disabled={spinning}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSpin}
              disabled={spinning || amount > balance || amount <= 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-4 rounded-lg font-black text-lg transition"
            >
              {spinning ? "SPINNING..." : "SPIN"}
            </button>
            <div className="text-xs text-gray-400 p-3 bg-gray-900 rounded text-center">
              <p>🎰 Match all 3 for jackpot!</p>
              <p>10x multiplier 🌟</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}