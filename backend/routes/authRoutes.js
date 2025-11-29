// backend/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Email/password auth
router.post("/register", register);
router.post("/login", login);

// Google auth
router.post("/google", googleAuth);

// Current user (protected)
router.get("/me", protect, getMe);

export default router;
