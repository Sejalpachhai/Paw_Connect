// backend/routes/storyRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  createStory,
  getAllStories,
  getMyStories,
} from "../controllers/storyController.js";

const router = express.Router();

// ✅ memory storage (no uploads folder needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
});

// Public feed
router.get("/", getAllStories);

// My stories (protected)
router.get("/me", protect, getMyStories);

// Create story (protected) + upload multiple media
router.post("/", protect, upload.array("media", 6), createStory);

export default router;
