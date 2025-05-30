import express from "express";
import {
    createDescription,
    vCreateDescription
} from "../controllers/description.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
    "/",
    authenticateAdmin,
    (req, res, next) => {
        const { error } = vCreateDescription.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
    createDescription
);

export default router;