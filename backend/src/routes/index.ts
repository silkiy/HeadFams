import { Router } from "express";
import multer from "multer";
import { getGallery, getGalleryOnePerCategory, uploadImage, uploadImageSchema } from "../controllers/gallery.controller";
import { Request, Response, NextFunction } from "express";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
    "/gallery",
    upload.single("image"),
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = uploadImageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
    uploadImage
);

router.get("/gallery", getGallery);

router.get("/gallery/one-per-category", getGalleryOnePerCategory);

export default router;
