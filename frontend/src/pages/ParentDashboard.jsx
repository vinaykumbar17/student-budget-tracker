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

export default function ParentDashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/parent/login");
      return;
    }
    fetchStudents();
    fetchRequests();
  }, []);

  if (!user) {
    return null;
  }

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/students/${user.id}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get(`/transactions/parent/${user.id}`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load requests");
    }
  };

  const handleApprove = async (id, studentId, amount) => {
    try {
      await API.put(`/transactions/approve/${id}`);
      await API.post(`/wallet/add-money`, { studentId, amount });
      fetchRequests();
    } catch (err) {
      console.error(err);
      setError("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/transactions/reject/${id}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setError("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Welcome, Parent ❤️</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* CHILDREN */}
      <h2 className="text-xl font-semibold mb-4">Your Children</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {students.map((s) => (
          <div
            key={s._id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <p className="font-bold text-lg">{s.name}</p>
            <p className="text-gray-600 text-sm">{s.email}</p>
          </div>
        ))}
      </div>

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

      {/* REQUESTS */}
      <h2 className="text-xl font-semibold mb-4">Student Requests</h2>

      <div className="space-y-5">
        {requests.length > 0 ? (
          requests.map((r) => (
            <div
              key={r._id}
              className="bg-white shadow-md p-6 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    ₹ {r.amount} — {r.category}
                  </p>
                  <p className="text-gray-600 mt-1">{r.description}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                    r.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : r.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {r.status === "pending" && (
                <div className="flex mt-4 gap-3">
                  <button
                    onClick={() =>
                      handleApprove(r._id, r.studentId, r.amount)
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(r._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No requests available.</p>
        )}
      </div>
    </>
  );
}
