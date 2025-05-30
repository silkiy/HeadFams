import { Router } from "express";
import multer from "multer";
import { getGallery, uploadImage } from "../controllers/gallery.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/gallery", upload.single("image"), uploadImage);
router.get("/gallery", getGallery);

export default router;
