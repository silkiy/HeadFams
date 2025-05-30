import * as express from "express";
import galleryRouter from "./gallery.route";

const router = express.Router();

router.use("/gallery", galleryRouter);

export default router;