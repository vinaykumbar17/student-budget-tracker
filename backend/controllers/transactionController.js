import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Notification from "../models/Notification.js";

// ===================== CREATE REQUEST =====================
export const createRequest = async (req, res) => {
  try {
    // Use authenticated user's ID instead of body
    const studentId = req.user._id.toString();
    const { amount, category, description } = req.body;

    // --- Validation ---
    if (!studentId)
      return res.status(400).json({ message: "studentId is required" });

    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ message: "amount is required" });
    }

    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a positive number" });
    }

    const allowed = ["Food", "Travel", "Stationery", "Entertainment", "Other"];
    if (category && !allowed.includes(category)) {
      return res.status(400).json({
        message: `category must be one of: ${allowed.join(", ")}`,
      });
    }

    // --- Wallet Fetch ---
    const wallet = await Wallet.findOne({ studentId });

    // FIX: If wallet does not exist → avoid crash
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "Wallet not found for student" });
    }

    // --- Monthly Limit Check ----
    if (wallet.monthlyLimit > 0) {
      if (wallet.monthlySpent + amt > wallet.monthlyLimit) {
        return res.status(400).json({
          message: "Monthly limit exceeded",
        });
      }
    }

    // Daily limit check
    if (wallet.dailyLimit > 0) {
      if (wallet.dailySpent + amt > wallet.dailyLimit) {
        return res.status(400).json({
          message: "Daily limit exceeded",
        });
      }
    }

    // --- Validate student existence ---
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.role !== "student") {
      return res
        .status(400)
        .json({ message: "Provided user is not a student" });
    }

    const parentId = student.parentId;
    if (!parentId) {
      return res
        .status(400)
        .json({ message: "Student has no parent assigned" });
    }

    // --- Create Transaction ---
    const transaction = new Transaction({
      studentId,
      parentId,
      amount: amt,
      category: category || "Other",
      description,
    });

    await transaction.save();

    return res
      .status(201)
      .json({ message: "Expense request sent", transaction });
  } catch (error) {
    console.error("createRequest error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// ===================== APPROVE REQUEST =====================
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user._id.toString();

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify the parent owns this transaction
    if (transaction.parentId.toString() !== parentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update transaction status
    const updated = await Transaction.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    // Update monthlySpent
    await Wallet.findOneAndUpdate(
      { studentId: transaction.studentId },
      {
        $inc: {
          monthlySpent: transaction.amount,
          dailySpent: transaction.amount
        }
      }
    );

    // Create notification for student
    await Notification.create({
    userId: transaction.studentId,
      message: `Your request of ₹${transaction.amount} (${transaction.category}) was approved`
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== REJECT REQUEST =====================
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user._id.toString();

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify the parent owns this transaction
    if (transaction.parentId.toString() !== parentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Transaction.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    await Notification.create({
      userId: transaction.studentId,
      message: `Your request of ₹${transaction.amount} (${transaction.category}) was rejected`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== STUDENT REQUESTS =====================
export const getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id.toString();

    // Students can only view their own requests
    if (req.user.role === "student" && studentId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const transactions = await Transaction.find({ studentId }).sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== PARENT REQUESTS =====================
export const getParentRequests = async (req, res) => {
  try {
    const { parentId } = req.params;
    const userId = req.user._id.toString();

    // Parents can only view their own requests
    if (req.user.role === "parent" && parentId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const transactions = await Transaction.find({ parentId }).sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
