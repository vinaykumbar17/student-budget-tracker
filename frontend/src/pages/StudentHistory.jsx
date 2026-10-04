import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentHistory() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/transactions/student/${user.id}`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-6">Transaction History 📜</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {transactions.map((t) => (
          <div
            key={t._id}
            className="bg-white p-5 shadow rounded border"
          >
            <p className="font-semibold text-lg">
              ₹ {t.amount} — {t.category}
            </p>
            <p className="text-gray-700">{t.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(t.createdAt).toLocaleString()}
            </p>

            <span
              className={`px-3 py-1 mt-2 inline-block rounded-full text-sm font-bold capitalize ${
                t.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : t.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {t.status}
            </span>
          </div>
        ))}
        {transactions.length === 0 && !error && (
          <p className="text-gray-600">No transactions found.</p>
        )}
      </div>
    </>
  );
}