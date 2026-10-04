import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student"); // "student" or "parent"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const userRole = res.data.user.role;

      // Check if selected role matches user's actual role
      if (userRole !== selectedRole) {
        setError(
          `This account is registered as a ${userRole}. Please select the correct role.`
        );
        setLoading(false);
        return;
      }

      // Save token + user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect based on role
      if (userRole === "student") {
        navigate("/student/dashboard");
      } else if (userRole === "parent") {
        navigate("/parent/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            💰 Budget Tracker
          </h1>
          <p className="text-gray-600">Welcome back! Please login to continue</p>
        </div>

        {/* Role Selection Buttons */}
        <div className="mb-6">
          <div className="flex gap-3 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("student");
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                selectedRole === "student"
                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                  : "bg-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              👨‍🎓 Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("parent");
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                selectedRole === "parent"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              👨‍👩‍👧 Parent Login
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${
              selectedRole === "student"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-center text-sm text-gray-600 mb-3">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="block w-full py-2 px-4 rounded-lg font-semibold text-center border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all"
            >
              👨‍👩‍👧 Register as Parent
            </Link>
            <p className="text-xs text-gray-500 text-center mt-2">
              Parents can create accounts for themselves and their children
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

