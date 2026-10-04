import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// REGISTER - Parent can register themselves and multiple children
export const register = async (req, res) => {
  try {
    const { parentData, childrenData } = req.body;

    // Register parent first
    if (!parentData || !parentData.name || !parentData.email || !parentData.password) {
      return res.status(400).json({ message: "Parent information is required" });
    }

    // Check if parent email exists
    const parentEmailExists = await User.findOne({ email: parentData.email });
    if (parentEmailExists) {
      return res.status(400).json({ message: "Parent email already registered" });
    }

    // Create parent account
    const salt = bcrypt.genSaltSync(10);
    const hashedParentPassword = bcrypt.hashSync(parentData.password, salt);

    const newParent = new User({
      name: parentData.name,
      email: parentData.email,
      password: hashedParentPassword,
      role: "parent"
    });

    const savedParent = await newParent.save();
    const parentId = savedParent._id;

    // Register children if provided
    const createdChildren = [];
    if (childrenData && Array.isArray(childrenData) && childrenData.length > 0) {
      for (const child of childrenData) {
        if (!child.name || !child.email || !child.password) {
          continue; // Skip invalid child data
        }

        // Check if child email exists
        const childEmailExists = await User.findOne({ email: child.email });
        if (childEmailExists) {
          continue; // Skip if email already exists
        }

        const hashedChildPassword = bcrypt.hashSync(child.password, salt);
        const newChild = new User({
          name: child.name,
          email: child.email,
          password: hashedChildPassword,
          role: "student",
          parentId: parentId
        });

        const savedChild = await newChild.save();
        createdChildren.push({
          name: savedChild.name,
          email: savedChild.email
        });
      }
    }

    res.status(201).json({
      message: "Registration successful",
      parent: {
        name: savedParent.name,
        email: savedParent.email
      },
      children: createdChildren,
      childrenCount: createdChildren.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        message: "If an account exists with this email, a password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // In production, send email with reset link
    // For now, return the token (in production, send via email)
    res.json({
      message: "Password reset token generated",
      resetToken: resetToken, // Remove this in production, send via email instead
      resetLink: `/reset-password?token=${resetToken}&email=${email}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
