import express from "express";
import { addMoney, getWallet, setMonthlyLimit } from "../controllers/walletController.js";
import Wallet from "../models/Wallet.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/add-money", requireRole(["parent"]), addMoney);
router.get("/:userId", getWallet);
router.post("/set-limit", requireRole(["parent"]), setMonthlyLimit);

router.post("/reset-daily", async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    await Wallet.findOneAndUpdate(
      { studentId },
      { dailySpent: 0 }
    );

    res.json({ message: "Daily spent reset" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

