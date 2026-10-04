import express from "express";
import {
  createRequest,
  getStudentRequests,
  getParentRequests,
  approveRequest,
  rejectRequest
} from "../controllers/transactionController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/create", requireRole(["student"]), createRequest);
router.get("/student/:studentId", getStudentRequests);
router.get("/parent/:parentId", getParentRequests);

router.put("/approve/:id", requireRole(["parent"]), approveRequest);
router.put("/reject/:id", requireRole(["parent"]), rejectRequest);

export default router;
