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
  const [winRate, setWinRate] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });

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
      
      // Calculate if user won
      const userWon = data.result.color === selected;
      if (userWon) {
        const winnings = amount * 1.85; // 85% profit margin for company
        setUserBalance(userBalance + winnings);
        setStats(s => ({ ...s, wins: s.wins + 1, totalProfit: s.totalProfit + (amount * 0.85) }));
        toast.success(`🎉 Won ₹${winnings.toFixed(0)}!`);
      } else {
        setUserBalance(userBalance - amount);
        setStats(s => ({ ...s, losses: s.losses + 1, totalProfit: s.totalProfit - amount }));
        toast.error(`Lost ₹${amount}`);
      }
      
      setTimeout(() => setResult(null), 3000);
    });

    return () => socket.disconnect();
  }, [selected, userBalance, amount]);

  const loadBalance = async () => {
    try {
      const res = await axios.get("/wallet/balance");
      setUserBalance(res.data.tokens);
      setStats(res.data.stats || { wins: 0, losses: 0, totalProfit: 0 });
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
      toast.success("Bet Placed! ✅");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bet placement failed");
    }
  };

  const resultColor = result?.color === "GREEN" ? "bg-green-500" : result?.color === "RED" ? "bg-red-500" : "bg-purple-500";
  const winPercentage = stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              🎨 Color Trading
            </h1>
            <p className="text-gray-400 mt-2">Predict the winning color and multiply your earnings</p>
          </div>
          <div className="text-right bg-gray-800 rounded-xl p-4 border border-purple-500">
            <p className="text-gray-300 text-sm">BALANCE</p>
            <p className="text-3xl font-bold text-yellow-400">₹{userBalance.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Timer Display */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-6 border border-purple-500 shadow-2xl">
              <p className="text-center text-gray-400 mb-4 text-lg">Next Round In</p>
              <div className="text-center">
                <div className={`text-7xl md:text-8xl font-black mb-4 transition-all ${
                  timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'
                }`}>
                  {timeLeft}s
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-purple-600 h-full transition-all"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`${resultColor} rounded-2xl p-8 mb-6 text-center font-black transform scale-105 transition-all shadow-2xl`}>
                <div className="text-6xl mb-4">{result.color === "GREEN" ? "✓" : result.color === "RED" ? "✗" : "◆"}</div>
                <p className="text-2xl mb-2">{result.color} Won!</p>
                <p className="text-lg opacity-90">Number: {result.number}</p>
              </div>
            )}

            {/* Color Selection */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { name: "GREEN", color: "from-green-500 to-green-600", emoji: "🟢" },
                { name: "RED", color: "from-red-500 to-red-600", emoji: "🔴" },
                { name: "VIOLET", color: "from-purple-500 to-purple-600", emoji: "🟣" },
              ].map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelected(color.name)}
                  disabled={betPlaced || timeLeft < 5}
                  className={`p-6 rounded-xl font-bold text-lg transition-all transform ${
                    selected === color.name
                      ? `bg-gradient-to-br ${color.color} scale-110 ring-4 ring-white shadow-2xl`
                      : "bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:scale-105"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-3xl mb-2">{color.emoji}</div>
                  {color.name}
                </button>
              ))}
            </div>

            {/* Betting Panel */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-300">Bet Amount (₹)</label>
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map(val => (
                      <button
                        key={val}
                        onClick={() => setAmount(Math.min(val, userBalance))}
                        disabled={betPlaced}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-bold disabled:opacity-50"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  disabled={betPlaced}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Bet</p>
                  <p className="text-xl font-bold text-yellow-400">₹{amount}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Potential Win</p>
                  <p className="text-xl font-bold text-green-400">₹{(amount * 1.85).toFixed(0)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Profit</p>
                  <p className="text-xl font-bold text-purple-400">₹{(amount * 0.85).toFixed(0)}</p>
                </div>
              </div>

              <button
                onClick={placeBet}
                disabled={betPlaced || timeLeft < 5 || amount > userBalance}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-black text-lg transition-all transform hover:scale-105 active:scale-95 text-gray-900"
              >
                {betPlaced ? "✅ Waiting for result..." : "Place Bet Now"}
              </button>
            </div>
          </div>

          {/* Sidebar - Stats & History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-purple-500 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📊 Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="text-xl font-bold text-green-400">{winPercentage}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Wins</span>
                  <span className="text-xl font-bold text-green-400">{stats.wins}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Losses</span>
                  <span className="text-xl font-bold text-red-400">{stats.losses}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-900 to-purple-900 rounded-lg border border-green-500">
                  <span className="text-gray-300">Total Profit</span>
                  <span className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{stats.totalProfit.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-purple-500 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📈 Recent Results</h3>
              <div className="grid grid-cols-5 gap-2">
                {history.length === 0 ? (
                  <p className="col-span-5 text-center text-gray-400 py-8">No results yet</p>
                ) : (
                  history.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-center font-bold text-sm transform hover:scale-110 transition ${
                        item.color === "GREEN"
                          ? "bg-green-600 hover:bg-green-700"
                          : item.color === "RED"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      {item.number}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-2xl p-6 border border-yellow-500 shadow-xl">
              <h4 className="font-bold text-yellow-300 mb-3">💡 How It Works</h4>
              <ul className="text-sm text-gray-200 space-y-2">
                <li>✓ Predict the winning color</li>
                <li>✓ 85% profit margin</li>
                <li>✓ Instant payouts</li>
                <li>✓ No hidden fees</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
