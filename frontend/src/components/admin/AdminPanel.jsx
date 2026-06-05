import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, withdrawalsRes, depositsRes] = await Promise.all([
        axios.get("/admin/stats"),
        axios.get("/admin/users"),
        axios.get("/admin/withdrawals"),
        axios.get("/admin/deposits"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setWithdrawals(withdrawalsRes.data);
      setDeposits(depositsRes.data);
    } catch (err) {
      toast.error("Failed to load admin data");
    }
  };

  const handleWithdrawalApproval = async (id, status) => {
    try {
      await axios.post(`/admin/withdrawal/${id}`, { status });
      toast.success(`Withdrawal ${status}!`);
      loadDashboardData();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDepositApproval = async (id, status) => {
    try {
      await axios.post(`/admin/deposit/${id}`, { status });
      toast.success(`Deposit ${status}!`);
      loadDashboardData();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">🛡️ Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {["dashboard", "users", "deposits", "withdrawals"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 font-semibold transition ${
                tab === t
                  ? "text-yellow-500 border-b-2 border-yellow-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📊 Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-600 rounded-lg p-6">
                <p className="text-gray-300">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-green-600 rounded-lg p-6">
                <p className="text-gray-300">Total Deposits</p>
                <p className="text-3xl font-bold">₹{stats.totalDeposits || 0}</p>
              </div>
              <div className="bg-red-600 rounded-lg p-6">
                <p className="text-gray-300">Total Withdrawals</p>
                <p className="text-3xl font-bold">₹{stats.totalWithdrawals || 0}</p>
              </div>
              <div className="bg-purple-600 rounded-lg p-6">
                <p className="text-gray-300">Total Bets</p>
                <p className="text-3xl font-bold">₹{stats.totalBets || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">👥 Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Balance</th>
                    <th className="p-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone}</td>
                      <td className="p-3 font-bold text-yellow-500">₹{user.wallet?.tokens || 0}</td>
                      <td className="p-3 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {tab === "deposits" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">💰 Deposit Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">{deposit.user?.username}</td>
                      <td className="p-3 font-bold">₹{deposit.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            deposit.status === "approved"
                              ? "bg-green-600"
                              : deposit.status === "rejected"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{new Date(deposit.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {deposit.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDepositApproval(deposit._id, "approved")}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDepositApproval(deposit._id, "rejected")}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {tab === "withdrawals" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🏦 Withdrawal Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">{withdrawal.user?.username}</td>
                      <td className="p-3 font-bold">₹{withdrawal.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            withdrawal.status === "approved"
                              ? "bg-green-600"
                              : withdrawal.status === "rejected"
                              ? "bg-red-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleWithdrawalApproval(withdrawal._id, "approved")}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleWithdrawalApproval(withdrawal._id, "rejected")}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
