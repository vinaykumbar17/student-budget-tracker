import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentNotifications() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      loadNotifications(); // refresh list
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification");
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
      <h1 className="text-3xl font-bold mb-6">Notifications 🔔</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-lg shadow-md bg-white border ${
                n.isRead ? "opacity-60" : "border-blue-500"
              }`}
            >
              <p className="text-gray-800 text-lg">{n.message}</p>

              <p className="text-gray-500 text-sm mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="mt-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-lg">No notifications yet.</p>
        )}
      </div>
    </>
  );
}
