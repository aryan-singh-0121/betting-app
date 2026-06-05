import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Rummy() {
  const [balance, setBalance] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [hand, setHand] = useState([]);
  const [table, setTable] = useState([]);
  const [amount, setAmount] = useState(100);
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameScore, setGameScore] = useState(0);

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

  const generateCards = () => {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const cards = [];
    for (let i = 0; i < 13; i++) {
      cards.push(values[i] + suits[Math.floor(Math.random() * suits.length)]);
    }
    return cards;
  };

  const startGame = () => {
    if (amount > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(balance - amount);
    const generatedHand = generateCards();
    const generatedTable = generateCards().slice(0, 3);
    
    setHand(generatedHand);
    setTable(generatedTable);
    setGameStarted(true);
    setGameScore(0);
    setSelectedCards([]);
    toast.success("Game started! 🎴");
  };

  const toggleCard = (card, isFromHand) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const playCards = () => {
    if (selectedCards.length < 3) {
      toast.error("Select at least 3 cards!");
      return;
    }
    
    const newHand = hand.filter(card => !selectedCards.includes(card));
    const newTable = [...table, ...selectedCards];
    
    setHand(newHand);
    setTable(newTable);
    setSelectedCards([]);
    
    const points = selectedCards.length * 10;
    setGameScore(gameScore + points);
    toast.success(`+${points} points!");
  };

  const declareWin = () => {
    if (hand.length > 2) {
      toast.error("Discard remaining cards first!");
      return;
    }
    
    const winnings = amount * 2 + gameScore * 5;
    updateBalance(balance + winnings);
    toast.success(`🎉 You won ₹${winnings}!`);
    
    setTimeout(() => {
      setGameStarted(false);
      setHand([]);
      setTable([]);
      setGameScore(0);
      setSelectedCards([]);
    }, 2000);
  };

  const dropGame = () => {
    toast.error("Game dropped! ₹" + amount + " lost");
    setTimeout(() => {
      setGameStarted(false);
      setHand([]);
      setTable([]);
      setGameScore(0);
      setSelectedCards([]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">🎴 Rummy</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-800 rounded-2xl p-8 border border-green-500">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Table Cards ({table.length})</h2>
              <div className="bg-green-700 rounded-lg p-8 min-h-32 flex items-center flex-wrap gap-3">
                {table.length === 0 ? (
                  <p className="text-gray-300 w-full text-center">No cards on table yet</p>
                ) : (
                  table.map((card, i) => (
                    <div key={i} className="px-4 py-3 bg-white text-green-900 rounded-lg font-bold text-lg border-2 border-white">
                      {card}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Your Hand ({hand.length})</h3>
              <div className="bg-gray-900 rounded-lg p-6 flex flex-wrap gap-3">
                {hand.length === 0 ? (
                  <p className="text-gray-400 w-full text-center">No cards yet</p>
                ) : (
                  hand.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCard(card, true)}
                      className={`px-6 py-4 rounded-lg font-bold border-2 transition ${
                        selectedCards.includes(card)
                          ? "bg-blue-600 border-blue-400 transform scale-110"
                          : "bg-blue-500 border-blue-300 hover:bg-blue-600"
                      }`}
                    >
                      {card}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-green-500 h-fit space-y-4">
            <div>
              <p className="text-gray-300 text-sm">Balance</p>
              <p className="text-3xl font-bold text-green-400">₹{balance}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Score</p>
              <p className="text-2xl font-bold text-yellow-400">{gameScore} pts</p>
            </div>
            
            {!gameStarted ? (
              <>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, +e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                />
                <button
                  onClick={startGame}
                  disabled={amount > balance || amount <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-lg font-bold transition"
                >
                  Start Game
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={playCards}
                  disabled={selectedCards.length < 3}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-bold transition"
                >
                  Play ({selectedCards.length})
                </button>
                <button
                  onClick={declareWin}
                  className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition"
                >
                  Declare
                </button>
                <button
                  onClick={dropGame}
                  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition"
                >
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