import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("create");
  const [formData, setFormData] = useState({ subject: "", category: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.message) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/support/ticket", formData);
      toast.success("Support ticket created! We'll respond shortly.");
      setFormData({ subject: "", category: "", message: "" });
      setTab("my-tickets");
      loadTickets();
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await axios.get("/support/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets");
    }
  };

  React.useEffect(() => {
    loadTickets();
  }, []);

  const faqs = [
    { q: "How do I deposit money?", a: "Click on Deposit button and choose your preferred payment method. Funds are credited instantly after verification." },
    { q: "What's the minimum withdrawal?", a: "Minimum withdrawal is ₹100. Withdrawals are processed within 24-48 hours." },
    { q: "Can I play multiple games?", a: "Yes! We offer Color Trading, Aviator, Chicken Road, Casino, and Rummy." },
    { q: "Is the platform safe?", a: "Yes! We use SSL encryption and have strict responsible gaming policies." },
    { q: "What if I lost my password?", a: "Click on 'Forgot Password' on the login page and follow the instructions." },
    { q: "Can I close my account?", a: "Yes, contact support and we'll help you close your account safely." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            ❓ Customer Support
          </h1>
          <p className="text-gray-400">We're here to help 24/7</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 flex-wrap">
          {["create", "my-tickets", "faq"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 font-semibold transition ${
                tab === t
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "create" ? "📝 Create Ticket" : t === "my-tickets" ? "🎫 My Tickets" : "📚 FAQs"}
            </button>
          ))}
        </div>

        {/* Create Ticket */}
        {tab === "create" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-orange-500 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Category</option>
                  <option value="deposit">Deposit Issue</option>
                  <option value="withdrawal">Withdrawal Issue</option>
                  <option value="game">Game Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue in detail"
                  rows="6"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 py-3 rounded-lg font-bold transition"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        )}

        {/* My Tickets */}
        {tab === "my-tickets" && (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-400 border border-gray-700">
                No support tickets yet
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-orange-500 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{ticket.subject}</h3>
                      <p className="text-sm text-gray-400">Ticket #{ticket._id.slice(-6)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.status === "resolved"
                          ? "bg-green-600"
                          : ticket.status === "in-progress"
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{ticket.message}</p>
                  {ticket.response && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Response from Support:</p>
                      <p className="text-white">{ticket.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* FAQs */}
        {tab === "faq" && (
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-orange-500 p-6 shadow-xl group cursor-pointer">
                <summary className="font-bold text-lg flex items-center justify-between">
                  {faq.q}
                  <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-300 mt-4 ml-6">{faq.a}</p>
              </details>
            ))}
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-3xl mb-2">📧</p>
            <p className="font-bold">Email</p>
            <p className="text-sm text-gray-400">support@bettingarena.com</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-3xl mb-2">📞</p>
            <p className="font-bold">Phone</p>
            <p className="text-sm text-gray-400">+91 9876543210</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-3xl mb-2">⏰</p>
            <p className="font-bold">Hours</p>
            <p className="text-sm text-gray-400">24/7 Support Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
