import * as express from "express";
import galleryRouter from "./gallery.route";
import authRouter from "./auth.route";
import descriptionRouter from "./janjiPria.route";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/gallery", galleryRouter);
router.use("/janji-pria", descriptionRouter);

export default router;