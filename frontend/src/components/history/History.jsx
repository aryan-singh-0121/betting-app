import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/transactions?type=${filter}`);
      setTransactions(res.data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "bet": return "🎲";
      case "win": return "🎉";
      case "loss": return "😢";
      case "deposit": return "💰";
      case "withdrawal": return "🏦";
      case "refund": return "🔄";
      default: return "📊";
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "win":
      case "deposit":
      case "refund":
        return "text-green-400";
      case "loss":
      case "withdrawal":
      case "bet":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === "all") return true;
    if (filter === "earnings") return ["win", "deposit", "refund"].includes(t.type);
    if (filter === "spending") return ["loss", "withdrawal", "bet"].includes(t.type);
    return t.type === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📊 Transaction History
          </h1>
          <p className="text-gray-400">View all your betting and wallet transactions</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["all", "earnings", "spending", "bet", "deposit", "withdrawal"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-indigo-600 ring-2 ring-indigo-400"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-indigo-500 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, i) => (
                    <tr
                      key={tx._id || i}
                      className="border-b border-gray-700 hover:bg-gray-700 transition"
                    >
                      <td className="p-4">
                        <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold capitalize">{tx.type}</p>
                          <p className="text-xs text-gray-400">{tx.description || "—"}</p>
                        </div>
                      </td>
                      <td className={`p-4 text-right font-bold ${getTransactionColor(tx.type)}`}>
                        {["loss", "withdrawal", "bet"].includes(tx.type) ? "-" : "+"}₹{Math.abs(
                          tx.amount
                        ).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            tx.status === "completed"
                              ? "bg-green-600 text-green-100"
                              : tx.status === "pending"
                              ? "bg-yellow-600 text-yellow-100"
                              : "bg-red-600 text-red-100"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-400 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {filteredTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-green-900 to-gray-900 rounded-xl p-6 border border-green-500">
              <p className="text-gray-300 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-black text-green-400">
                +₹
                {filteredTransactions
                  .filter((t) => ["win", "deposit", "refund"].includes(t.type))
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-900 to-gray-900 rounded-xl p-6 border border-red-500">
              <p className="text-gray-300 text-sm mb-1">Total Spending</p>
              <p className="text-3xl font-black text-red-400">
                -₹
                {Math.abs(
                  filteredTransactions
                    .filter((t) => ["loss", "withdrawal", "bet"].includes(t.type))
                    .reduce((sum, t) => sum - t.amount, 0)
                ).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-xl p-6 border border-indigo-500">
              <p className="text-gray-300 text-sm mb-1">Net</p>
              <p className={`text-3xl font-black ${filteredTransactions.reduce((sum, t) => {
                if (["win", "deposit", "refund"].includes(t.type)) return sum + t.amount;
                if (["loss", "withdrawal", "bet"].includes(t.type)) return sum - t.amount;
                return sum;
              }, 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {filteredTransactions.reduce((sum, t) => {
                  if (["win", "deposit", "refund"].includes(t.type)) return sum + t.amount;
                  if (["loss", "withdrawal", "bet"].includes(t.type)) return sum - t.amount;
                  return sum;
                }, 0) >= 0 ? "+" : "-"}
                ₹
                {Math.abs(
                  filteredTransactions.reduce((sum, t) => {
                    if (["win", "deposit", "refund"].includes(t.type)) return sum + t.amount;
                    if (["loss", "withdrawal", "bet"].includes(t.type)) return sum - t.amount;
                    return sum;
                  }, 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
