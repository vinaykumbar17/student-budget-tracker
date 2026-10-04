import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user._id.toString();

    // Users can only view their own notifications
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
