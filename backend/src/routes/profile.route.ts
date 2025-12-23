import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public get profile
router.get("/", getProfile);

// Protected update profile
router.put("/", authenticateAdmin, upload.single("photo"), updateProfile);

export default router;
