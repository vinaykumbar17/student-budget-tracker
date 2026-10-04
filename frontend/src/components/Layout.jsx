import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    // If no user → redirect
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isStudent = user.role === "student";
  const isParent = user.role === "parent";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-8 text-blue-600">
          💰 Budget Tracker
        </h1>

        <nav className="space-y-4">
          {/* STUDENT LINKS */}
          {isStudent && (
            <>
              <a
                href="/student/dashboard"
                className="block text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </a>

              <a
                href="/student/request"
                className="block text-gray-700 hover:text-blue-600"
              >
                Send Request
              </a>

              <a
                href="/student/history"
                className="block text-gray-700 hover:text-blue-600"
              >
                History
              </a>
            </>
          )}

          {/* PARENT LINKS */}
          {isParent && (
            <>
              <a
                href="/parent/dashboard"
                className="block text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </a>

              <a
                href="/parent/history"
                className="block text-gray-700 hover:text-blue-600"
              >
                History
              </a>
            </>
          )}

          {/* LOGOUT */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="mt-10 block text-red-500 font-semibold"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
