import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

// Parent adds pocket money to student wallet
export const addMoney = async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const parentId = req.user._id.toString();

    if (!studentId || !amount) {
      return res.status(400).json({ message: "studentId and amount are required" });
    }

    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: "amount must be a positive number" });
    }

    // Check if user exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify the student belongs to this parent
    if (student.parentId?.toString() !== parentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    let wallet = await Wallet.findOne({ studentId });

    if (!wallet) {
      wallet = new Wallet({ studentId, balance: 0 });
    }

    wallet.balance += amt;

    await wallet.save();

    res.json({ message: "Money added successfully", wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get wallet info of a user
export const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user._id.toString();

    // Students can only view their own wallet
    // Parents can view their children's wallets
    if (req.user.role === "student" && userId !== authenticatedUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If parent, verify the student is their child
    if (req.user.role === "parent") {
      const User = (await import("../models/User.js")).default;
      const student = await User.findById(userId);
      if (!student || student.parentId?.toString() !== authenticatedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    let wallet = await Wallet.findOne({ studentId: userId });

    if (!wallet) {
      // If no wallet exists, create an empty one
      wallet = new Wallet({
        studentId: userId,
        balance: 0,
        monthlyLimit: 0,
        dailyLimit: 0
      });
      await wallet.save();
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setMonthlyLimit = async (req, res) => {
  try {
    const { studentId, limit } = req.body;
    const parentId = req.user._id.toString();

    if (!studentId || limit === undefined) {
      return res.status(400).json({ message: "studentId and limit are required" });
    }

    const lim = Number(limit);
    if (Number.isNaN(lim) || lim < 0) {
      return res.status(400).json({ message: "limit must be a non-negative number" });
    }

    // Verify the student belongs to this parent
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.parentId?.toString() !== parentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    let wallet = await Wallet.findOne({ studentId });

    if (!wallet) {
      wallet = new Wallet({
        studentId,
        monthlyLimit: lim,
        balance: 0,
        dailyLimit: 0
      });
      await wallet.save();
    } else {
      wallet.monthlyLimit = lim;
      await wallet.save();
    }

    res.json({ message: "Limit updated", wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};