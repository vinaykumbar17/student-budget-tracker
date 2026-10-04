import express from "express";
import { getStudentsForParent } from "../controllers/userController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get("/students/:parentId", requireRole(["parent"]), getStudentsForParent);

export default router;
