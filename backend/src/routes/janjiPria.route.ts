import express from "express";
import {
    createJanjiPria,
    getApprovedJanjiPria,
    getAllJanjiPria,
    vCreateJanjiPria,
} from "../controllers/janjiPria.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
    "/",
    authenticateAdmin,
    (req, res, next) => {
        const { error } = vCreateJanjiPria.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
    createJanjiPria
);

router.get(
    "/approved",
    getApprovedJanjiPria
);

router.get(
    "/",
    getAllJanjiPria
);

export default router;