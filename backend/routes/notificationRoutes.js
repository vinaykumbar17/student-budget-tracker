import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get("/:userId", getNotifications);
router.put("/read/:id", markAsRead);

export default router;
