import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Parent data
  const [parentData, setParentData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Children data
  const [children, setChildren] = useState([
    { name: "", email: "", password: "", confirmPassword: "" }
  ]);

  const addChild = () => {
    setChildren([...children, { name: "", email: "", password: "", confirmPassword: "" }]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate parent data
    if (!parentData.name || !parentData.email || !parentData.password) {
      setError("Please fill in all parent fields");
      return;
    }

    if (parentData.password !== parentData.confirmPassword) {
      setError("Parent passwords do not match");
      return;
    }

    if (parentData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate children data
    const validChildren = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.name || child.email || child.password) {
        if (!child.name || !child.email || !child.password) {
          setError(`Please fill in all fields for child ${i + 1}`);
          return;
        }
        if (child.password !== child.confirmPassword) {
          setError(`Passwords do not match for child ${i + 1}`);
          return;
        }
        if (child.password.length < 6) {
          setError(`Password must be at least 6 characters for child ${i + 1}`);
          return;
        }
        validChildren.push({
          name: child.name,
          email: child.email,
          password: child.password
        });
      }
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        parentData: {
          name: parentData.name,
          email: parentData.email,
          password: parentData.password
        },
        childrenData: validChildren
      });

      setSuccess(
        `Registration successful! ${response.data.childrenCount} child account(s) created. Redirecting to login...`
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              👨‍👩‍👧 Parent Registration
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Create your account and add your children's accounts
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Section */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span> Parent Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={parentData.name}
                    onChange={(e) =>
                      setParentData({ ...parentData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={parentData.email}
                    onChange={(e) =>
                      setParentData({ ...parentData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={parentData.password}
                    onChange={(e) =>
                      setParentData({ ...parentData, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={parentData.confirmPassword}
                    onChange={(e) =>
                      setParentData({
                        ...parentData,
                        confirmPassword: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Children Section */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">👨‍🎓</span> Children Accounts
                  <span className="text-sm font-normal text-gray-500">
                    (Optional)
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={addChild}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  + Add Child
                </button>
              </div>

              <div className="space-y-4">
                {children.map((child, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700">
                        Child {index + 1}
                      </h3>
                      {children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Child Name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                        value={child.name}
                        onChange={(e) =>
                          updateChild(index, "name", e.target.value)
                        }
                      />
                      <input
                        type="email"
                        placeholder="Child Email"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                        value={child.email}
                        onChange={(e) =>
                          updateChild(index, "email", e.target.value)
                        }
                      />
                      <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                        value={child.password}
                        onChange={(e) =>
                          updateChild(index, "password", e.target.value)
                        }
                        minLength={6}
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                        value={child.confirmPassword}
                        onChange={(e) =>
                          updateChild(index, "confirmPassword", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${
                  loading
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transform hover:scale-105"
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
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>

              <Link
                to="/login"
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

