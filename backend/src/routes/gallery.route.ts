import { Router } from "express";
import multer from "multer";
import { getGallery, getGalleryOnePerCategory, uploadImage, uploadImageSchema, deleteImage } from "../controllers/gallery.controller";
import { Request, Response, NextFunction } from "express";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
    "/",
    upload.single("image"),
    authenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = uploadImageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
    uploadImage
);

router.get("/", getGallery);

router.get("/one-per-category", getGalleryOnePerCategory);

router.delete("/delete/:id",authenticateAdmin, deleteImage);

export default router;
