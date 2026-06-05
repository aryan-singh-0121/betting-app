import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ChickenRoad() {
  const [gameState, setGameState] = useState("betting");
  const [score, setScore] = useState(0);
  const [amount, setAmount] = useState(100);
  const [balance, setBalance] = useState(0);
  const [maxDistance, setMaxDistance] = useState(0);
  const [betPlaced, setBetPlaced] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameInterval, setGameInterval] = useState(null);

  useEffect(() => {
    loadBalance();
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
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

  const placeBet = () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }
    if (amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setBetPlaced(true);
    setGameState("playing");
    updateBalance(balance - amount);
    startGame();
    toast.success(`Bet placed: ₹${amount}`);
  };

  const startGame = () => {
    setGameRunning(true);
    setScore(0);
    let distance = 0;
    let crashed = false;

    const interval = setInterval(() => {
      const randomCrash = Math.random() < 0.02; // 2% chance to crash each frame
      
      if (randomCrash) {
        crashed = true;
        clearInterval(interval);
        setGameState("crashed");
        setGameRunning(false);
        toast.error(`Game Over! Distance: ${distance}m`);
        
        setTimeout(() => {
          setGameState("betting");
          setBetPlaced(false);
          setScore(0);
        }, 3000);
      } else {
        distance++;
        setScore(distance);
        if (distance > maxDistance) setMaxDistance(distance);
      }
    }, 100);

    setGameInterval(interval);
  };

  const cashOut = () => {
    if (gameInterval) clearInterval(gameInterval);
    const winnings = Math.floor(amount * (1 + score / 100));
    updateBalance(balance + winnings);
    setGameState("won");
    setGameRunning(false);
    toast.success(`You won ₹${winnings}! 🎉`);
    
    setTimeout(() => {
      setGameState("betting");
      setBetPlaced(false);
      setScore(0);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">🐔 Chicken Road</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-8 border border-yellow-500">
            <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden border-2 border-yellow-500 flex items-center justify-center">
              <div className="text-center">
                <p className="text-9xl mb-4 animate-bounce">🐔</p>
                <p className="text-5xl font-bold text-yellow-400">{score}m</p>
                <p className="text-gray-400 mt-4">
                  {gameRunning ? "Keep moving!" : gameState === "playing" ? "Game Started" : "Ready to play?"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-yellow-500 space-y-4 h-fit">
            <div className="text-right">
              <p className="text-gray-300 text-sm">Balance</p>
              <p className="text-3xl font-bold text-yellow-400">₹{balance}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-semibold mb-2">Bet Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, +e.target.value))}
                disabled={gameRunning}
                className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white disabled:opacity-50"
              />
            </div>
            {!gameRunning ? (
              <button
                onClick={placeBet}
                disabled={gameRunning || amount > balance || amount <= 0}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 py-3 rounded-lg font-bold transition"
              >
                Start Game
              </button>
            ) : (
              <button
                onClick={cashOut}
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition animate-pulse"
              >
                💰 Cash Out
              </button>
            )}
            <div className="text-center text-sm text-gray-400 p-3 bg-gray-900 rounded">
              <p>Max Distance: <span className="text-yellow-400 font-bold">{maxDistance}m</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}