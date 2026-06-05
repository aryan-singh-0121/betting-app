import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [bankDetails, setBankDetails] = useState({ accountHolder: "", accountNumber: "", ifsc: "" });
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
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

  const methods = [
    { id: "upi", name: "UPI", icon: "📱", min: 100, max: 100000 },
    { id: "bank", name: "Bank Transfer", icon: "🏦", min: 500, max: 500000 },
  ];

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount)) {
      toast.error("Enter a valid amount");
      return;
    }

    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    const selectedMethod = methods.find(m => m.id === method);
    if (amount < selectedMethod.min || amount > selectedMethod.max) {
      toast.error(`Amount must be between ₹${selectedMethod.min} - ₹${selectedMethod.max}`);
      return;
    }

    if (method === "bank" && (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifsc)) {
      toast.error("Fill all bank details");
      return;
    }

    if (method === "upi" && !upiId) {
      toast.error("Enter UPI ID");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/wallet/withdraw", {
        amount: parseFloat(amount),
        method,
        bankDetails: method === "bank" ? bankDetails : null,
        upiId: method === "upi" ? upiId : null,
      });
      toast.success("Withdrawal request submitted! Pending approval.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const currentMethod = methods.find(m => m.id === method);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
        >
          ← Back
        </button>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-purple-500 shadow-2xl">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏦 Withdraw Funds
          </h1>
          <p className="text-gray-400 mb-4">Withdraw your winnings securely</p>

          {/* Balance Display */}
          <div className="bg-purple-900 border border-purple-500 rounded-lg p-4 mb-8">
            <p className="text-gray-300 text-sm">Available Balance</p>
            <p className="text-3xl font-black text-purple-300">₹{balance.toFixed(2)}</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-semibold mb-4">Select Withdrawal Method</label>
              <div className="grid grid-cols-2 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-4 rounded-xl font-bold transition-all transform ${
                      method === m.id
                        ? "bg-purple-600 ring-2 ring-purple-400 scale-105"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-sm">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Details (for Bank Transfer) */}
            {method === "bank" && (
              <div className="space-y-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-bold text-purple-400 mb-3">Bank Account Details</h3>
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* UPI Details (for UPI) */}
            {method === "upi" && (
              <div>
                <label className="block text-sm font-semibold mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="username@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

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
                max={Math.min(currentMethod?.max, balance)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    onClick={() => setAmount(Math.min(val, balance).toString())}
                    disabled={val > balance}
                    className="px-4 py-2 bg-gray-700 hover:bg-purple-600 disabled:opacity-50 rounded-lg font-bold text-sm transition"
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {amount && (
              <div className="bg-purple-900 border border-purple-500 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Withdrawal Amount</span>
                  <span className="font-bold">₹{parseFloat(amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Processing Fee</span>
                  <span className="font-bold text-purple-300">Free</span>
                </div>
                <div className="border-t border-purple-600 mt-2 pt-2 flex justify-between">
                  <span className="font-bold">You Will Receive</span>
                  <span className="text-xl font-black text-purple-300">₹{parseFloat(amount || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" required className="mt-1 w-4 h-4 rounded" />
              <p className="text-sm text-gray-400">
                I confirm that the details are correct. Withdrawal will be processed within 24-48 hours.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount || (method === "bank" && (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifsc)) || (method === "upi" && !upiId)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-4 rounded-lg font-black text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? "Processing..." : "Request Withdrawal"}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="font-bold text-purple-400 mb-3">✓ Withdrawal Info</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>✓ Minimum withdrawal: ₹{Math.min(...methods.map(m => m.min))}</li>
              <li>✓ Processing time: 24-48 hours</li>
              <li>✓ Zero processing fees</li>
              <li>✓ Funds transferred directly to your account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
