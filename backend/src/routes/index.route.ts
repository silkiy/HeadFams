import * as express from "express";
import galleryRouter from "./gallery.route";
import authRouter from "./auth.route";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/gallery", galleryRouter);

export default router;