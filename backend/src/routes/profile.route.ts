import { Router } from "express";
import { getProfiles, createProfile, updateProfile, deleteProfile } from "../controllers/profile.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public get all profiles
router.get("/", getProfiles);

// Protected routes
router.post("/", authenticateAdmin, upload.single("photo"), createProfile);
router.put("/:id", authenticateAdmin, upload.single("photo"), updateProfile);
router.delete("/:id", authenticateAdmin, deleteProfile);

export default router;
