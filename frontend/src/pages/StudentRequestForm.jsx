import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentRequestForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please login first!");
      setMessageType("error");
      return;
    }

    try {
      await API.post("/transactions/create", {
        amount,
        category,
        description,
      });

      setMessage("Request Sent Successfully!");
      setMessageType("success");
      setTimeout(() => navigate("/student/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Something went wrong!";
      setMessage(errorMsg);
      setMessageType("error");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Send Expense Request
        </h2>

        {message && (
          <p
            className={`text-center font-medium mb-3 ${
              messageType === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 mb-3 border rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="w-full p-2 mb-3 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Stationery</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>

        <textarea
          placeholder="Description"
          className="w-full p-2 mb-3 border rounded"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Send Request
        </button>
      </form>
    </div>
  );
}
