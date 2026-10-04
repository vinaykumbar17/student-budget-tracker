import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    balance: {
      type: Number,
      default: 0
    },

    monthlyLimit: {
      type: Number,
      default: 0
    },
    monthlySpent: {
      type: Number,
      default: 0
    },

    dailyLimit: {
      type: Number,
      default: 0
    },
    dailySpent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
