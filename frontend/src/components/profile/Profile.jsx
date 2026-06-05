import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email,
        phone: res.data.phone,
        fullName: res.data.fullName,
      });
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/auth/profile", formData);
      toast.success("Profile updated successfully!");
      setEditing(false);
      loadProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = prompt("Enter old password:");
    const newPassword = prompt("Enter new password:");
    const confirmPassword = prompt("Confirm new password:");

    if (!oldPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      await axios.post("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error("Password change failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
        >
          ← Back
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-cyan-500 shadow-2xl mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                👤 {user.username}
              </h1>
              <p className="text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-bold transition"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* KYC Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${user.kycStatus === "verified" ? "border-green-500 bg-green-900" : "border-yellow-500 bg-yellow-900"}`}>
              <p className="text-sm text-gray-300 mb-1">KYC Status</p>
              <p className="font-bold capitalize">{user.kycStatus || "Not Verified"}</p>
            </div>
            <div className="p-4 rounded-lg border border-blue-500 bg-blue-900">
              <p className="text-sm text-gray-300 mb-1">Total Balance</p>
              <p className="font-bold text-yellow-400">₹{user.wallet?.tokens || 0}</p>
            </div>
            <div className="p-4 rounded-lg border border-purple-500 bg-purple-900">
              <p className="text-sm text-gray-300 mb-1">Account Level</p>
              <p className="font-bold capitalize">{user.level || "Standard"}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-cyan-500 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">📋 Account Information</h2>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username || ""}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Bets</p>
                <p className="text-2xl font-bold text-cyan-400">{user.stats?.totalBets || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Wins</p>
                <p className="text-2xl font-bold text-green-400">{user.stats?.wins || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Losses</p>
                <p className="text-2xl font-bold text-red-400">{user.stats?.losses || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-purple-400">
                  {user.stats?.totalBets > 0 
                    ? ((user.stats.wins / user.stats.totalBets) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>

            {/* Security Section */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h3 className="font-bold mb-4 text-cyan-400">🔒 Security</h3>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
              >
                Change Password
              </button>
            </div>

            {/* Submit Button */}
            {editing && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 py-3 rounded-lg font-bold transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </div>

        {/* Account Actions */}
        <div className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-red-500 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-red-400">⚠️ Danger Zone</h2>
          <button
            onClick={() => {
              if (window.confirm("Are you sure? This action cannot be undone.")) {
                localStorage.removeItem("userToken");
                navigate("/login");
                toast.success("Logged out successfully");
              }
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
