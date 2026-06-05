import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const methods = [
    { id: "upi", name: "UPI", icon: "📱", min: 100, max: 100000 },
    { id: "bank", name: "Bank Transfer", icon: "🏦", min: 500, max: 500000 },
    { id: "card", name: "Credit/Debit Card", icon: "💳", min: 100, max: 200000 },
    { id: "wallet", name: "Digital Wallet", icon: "👛", min: 100, max: 100000 },
  ];

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount)) {
      toast.error("Enter a valid amount");
      return;
    }

    const selectedMethod = methods.find(m => m.id === method);
    if (amount < selectedMethod.min || amount > selectedMethod.max) {
      toast.error(`Amount must be between ₹${selectedMethod.min} - ₹${selectedMethod.max}`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/wallet/deposit", { amount: parseFloat(amount), method });
      toast.success("Deposit initiated! Pending approval.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const currentMethod = methods.find(m => m.id === method);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
        >
          ← Back
        </button>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-green-500 shadow-2xl">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            💰 Add Money
          </h1>
          <p className="text-gray-400 mb-8">Deposit funds to your account instantly</p>

          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-semibold mb-4">Select Payment Method</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-4 rounded-xl font-bold transition-all transform ${
                      method === m.id
                        ? "bg-green-600 ring-2 ring-green-400 scale-105"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-sm">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold">Amount (₹)</label>
                <p className="text-xs text-gray-400">
                  Min: ₹{currentMethod?.min} | Max: ₹{currentMethod?.max}
                </p>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={currentMethod?.min}
                max={currentMethod?.max}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Quick Amount Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Quick Select</label>
              <div className="grid grid-cols-4 gap-3">
                {[500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-4 py-2 bg-gray-700 hover:bg-green-600 rounded-lg font-bold text-sm transition"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {amount && (
              <div className="bg-green-900 border border-green-500 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Deposit Amount</span>
                  <span className="font-bold">₹{parseFloat(amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Processing Fee</span>
                  <span className="font-bold text-green-400">Free</span>
                </div>
                <div className="border-t border-green-600 pt-2 flex justify-between">
                  <span className="font-bold">Total Credit</span>
                  <span className="text-xl font-black text-green-400">₹{parseFloat(amount || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded" />
              <p className="text-sm text-gray-400">
                I agree to the deposit terms and conditions. The amount will be credited after verification.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 py-4 rounded-lg font-black text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="font-bold text-green-400 mb-3">✓ Why deposit with us?</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>✓ Instant credit to your account</li>
              <li>✓ 100% secure transactions</li>
              <li>✓ Multiple payment options</li>
              <li>✓ 24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
