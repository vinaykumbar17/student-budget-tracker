import User from "../models/User.js";

export const getStudentsForParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const authenticatedParentId = req.user._id.toString();

    // Parents can only view their own children
    if (parentId !== authenticatedParentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await User.find({ parentId, role: "student" });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
