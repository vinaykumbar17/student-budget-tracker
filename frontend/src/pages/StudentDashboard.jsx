import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import MonthlySpendingChart from "../components/charts/MonthlySpendingChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import DailyLineChart from "../components/charts/DailyLineChart";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import {
  getMonthlySpendingData,
  getCategorySpendingData,
  getDailySpendingData,
  getWeeklySpendingData
} from "../utils/chartUtils";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchWallet();
    fetchRequests();
    fetchNotifications();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/wallet/${user.id}`);
      setWallet(res.data);
    } catch (err) {
      console.error("Error fetching wallet:", err);
      setError("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get(`/transactions/student/${user.id}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.name} 👋
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Wallet Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold">Wallet Balance</h2>
        <p className="text-4xl font-extrabold text-blue-600 mt-2">
          ₹ {wallet ? wallet.balance : 0}
        </p>
      </div>

      {/* LIMIT SECTION */}
      {wallet && (
        <>
          {/* Monthly Limit */}
          <div className="bg-white shadow-md rounded-xl p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Limit</h3>
            <p className="font-medium">Limit: ₹ {wallet.monthlyLimit}</p>
            <p className="font-medium">Spent: ₹ {wallet.monthlySpent}</p>

            {wallet.monthlyLimit > 0 && (
              <p className="font-bold text-blue-700 mt-2">
                Remaining: ₹ {wallet.monthlyLimit - wallet.monthlySpent}
              </p>
            )}
          </div>

          {/* Daily Limit */}
          <div className="bg-white shadow-md rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Daily Limit</h3>
            <p className="font-medium">Limit: ₹ {wallet.dailyLimit}</p>
            <p className="font-medium">Spent Today: ₹ {wallet.dailySpent}</p>

            {wallet.dailyLimit > 0 && (
              <p className="font-bold text-blue-700 mt-2">
                Remaining Today: ₹ {wallet.dailyLimit - wallet.dailySpent}
              </p>
            )}
          </div>
        </>
      )}

      {/* New Request Button */}
      <button
        onClick={() => navigate("/student/request")}
        className="bg-green-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-green-700"
      >
        + New Request
      </button>

      {/* Charts Section */}
      <h2 className="text-2xl font-semibold mb-4 mt-8">📈 Spending Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthlySpendingChart data={getMonthlySpendingData(requests)} />
        <CategoryPieChart data={getCategorySpendingData(requests)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DailyLineChart data={getDailySpendingData(requests)} />
        <WeeklyBarChart data={getWeeklySpendingData(requests)} />
      </div>

      {/* Recent Requests */}
      <h2 className="text-xl font-semibold mb-3">Recent Requests</h2>

      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-sm p-4 rounded-lg flex justify-between items-center border border-gray-200"
            >
              <div>
                <p className="font-semibold text-lg">
                  ₹ {req.amount} — {req.category}
                </p>
                <p className="text-gray-600">{req.description}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                  req.status === "approved"
                    ? "bg-green-100 text-green-600"
                    : req.status === "rejected"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {req.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No requests yet.</p>
        )}
      </div>
    </>
  );
}
