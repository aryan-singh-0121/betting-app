import React, { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";

export default function Aviator() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState("waiting");
  const [amount, setAmount] = useState(100);
  const [userBalance, setUserBalance] = useState(0);
  const [betActive, setBetActive] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0, cashouts: 0 });

  useEffect(() => {
    socket.connect();
    loadBalance();

    socket.on("aviator-multiplier", (data) => {
      setMultiplier(data.multiplier);
      setGameState("flying");
    });

    socket.on("aviator-crash", (data) => {
      setGameState("crashed");
      toast.error(`💥 Crashed at ${data.multiplier.toFixed(2)}x!`);
      setHistory((h) => [{ multiplier: data.multiplier, status: "crashed" }, ...h.slice(0, 9)]);
      setBetActive(false);
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
      setStats(res.data.stats || { wins: 0, losses: 0, totalProfit: 0, cashouts: 0 });
    } catch (err) {
      toast.error("Failed to load balance");
    }
  };

  const placeBet = async () => {
    if (amount > userBalance) {
      toast.error("Insufficient balance!");
      return;
    }
    if (gameState !== "waiting") {
      toast.error("Game already started!");
      return;
    }
    try {
      await axios.post("/games/bet", { gameType: "AVIATOR", amount });
      setBetActive(true);
      setUserBalance(userBalance - amount);
      setWinnings(0);
      toast.success("✈️ Bet placed! Good luck!");
    } catch (err) {
      toast.error("Bet placement failed");
    }
  };

  const cashOut = async () => {
    if (!betActive) {
      toast.error("No active bet!");
      return;
    }
    try {
      const profit = amount * (multiplier - 1) * 0.85; // 85% goes to company
      const totalWinnings = amount + profit;
      
      await axios.post("/games/cashout", { gameType: "AVIATOR", multiplier, winnings: totalWinnings });
      
      setWinnings(totalWinnings);
      setBetActive(false);
      setUserBalance(userBalance + totalWinnings);
      setHistory((h) => [{ multiplier, status: "cashed_out" }, ...h.slice(0, 9)]);
      setStats(s => ({ ...s, wins: s.wins + 1, cashouts: s.cashouts + 1, totalProfit: s.totalProfit + profit }));
      
      toast.success(`🎉 Cashed out! Won: ₹${totalWinnings.toFixed(0)}`);
      setMultiplier(1.0);
      setGameState("waiting");
    } catch (err) {
      toast.error("Cashout failed");
    }
  };

  const potentialWinnings = betActive ? (amount + amount * (multiplier - 1) * 0.85).toFixed(0) : 0;
  const winRate = stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ✈️ Aviator
            </h1>
            <p className="text-gray-400 mt-2">Cash out before the plane crashes!</p>
          </div>
          <div className="text-right bg-gray-800 rounded-xl p-4 border border-blue-500">
            <p className="text-gray-300 text-sm">BALANCE</p>
            <p className="text-3xl font-bold text-yellow-400">₹{userBalance.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Game Canvas */}
            <div className="bg-gradient-to-br from-blue-900 to-gray-900 rounded-2xl p-12 mb-6 border-2 border-blue-500 shadow-2xl relative h-80 flex items-center justify-center overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
              </div>

              {/* Game Content */}
              <div className="relative z-10 text-center">
                <div
                  className={`text-8xl md:text-9xl transition-all duration-100 ${
                    gameState === "flying" ? "animate-bounce" : gameState === "crashed" ? "text-red-500" : ""
                  }`}
                >
                  ✈️
                </div>
                <div className="mt-8">
                  <div className="text-7xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {multiplier.toFixed(2)}x
                  </div>
                  <p className="text-xl text-gray-300 mt-4">
                    {gameState === "waiting"
                      ? "Ready to take off..."
                      : gameState === "flying"
                      ? "🚀 Plane is flying!"
                      : "💥 Crashed!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Betting Panel */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-300">Bet Amount (₹)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[100, 500, 1000, 5000].map(val => (
                      <button
                        key={val}
                        onClick={() => setAmount(Math.min(val, userBalance))}
                        disabled={betActive || gameState !== "waiting"}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold disabled:opacity-50 transition"
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
                  disabled={betActive}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Bet</p>
                  <p className="text-xl font-bold text-yellow-400">₹{amount}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Multiplier</p>
                  <p className="text-xl font-bold text-blue-400">{multiplier.toFixed(2)}x</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-gray-400">Potential Win</p>
                  <p className="text-xl font-bold text-green-400">₹{potentialWinnings}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={placeBet}
                  disabled={betActive || gameState !== "waiting" || amount > userBalance}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-black text-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  Place Bet
                </button>
                <button
                  onClick={cashOut}
                  disabled={!betActive || gameState !== "flying"}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-black text-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  💰 Cash Out
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-blue-500 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📊 Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="text-xl font-bold text-blue-400">{winRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Wins</span>
                  <span className="text-xl font-bold text-green-400">{stats.wins}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Cashouts</span>
                  <span className="text-xl font-bold text-cyan-400">{stats.cashouts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-900 to-blue-900 rounded-lg border border-green-500">
                  <span className="text-gray-300">Total Profit</span>
                  <span className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{stats.totalProfit.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-blue-500 shadow-xl">
              <h3 className="text-xl font-bold mb-4">📈 Crash History</h3>
              <div className="grid grid-cols-3 gap-2">
                {history.length === 0 ? (
                  <p className="col-span-3 text-center text-gray-400 py-8">No history yet</p>
                ) : (
                  history.map((item, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-center font-bold text-sm transition transform hover:scale-110 ${
                        item.status === "cashed_out"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      title={item.status === "cashed_out" ? "Cashed Out" : "Crashed"}
                    >
                      {item.multiplier.toFixed(2)}x
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-2xl p-6 border border-cyan-500 shadow-xl">
              <h4 className="font-bold text-cyan-300 mb-3">💡 Pro Tips</h4>
              <ul className="text-sm text-gray-200 space-y-2">
                <li>✓ Set a target & cash out early</li>
                <li>✓ Don't get greedy</li>
                <li>✓ Bet small, win big</li>
                <li>✓ Play responsibly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
