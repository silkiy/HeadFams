import express from "express";
import {
    adminLogin,
    secretLogin,
    setSecretPassword,
    validateSecretLogin,
    validateSetSecretPassword
} from "../controllers/auth.controller";
import { authenticateAdmin, authenticateSecret } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", adminLogin);

router.post("/secret-login", (req, res, next) => {
    const { error } = validateSecretLogin(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}, secretLogin);

router.post("/set-secret-password", authenticateAdmin,
    (req, res, next) => {
        const { error } = validateSetSecretPassword(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    }, setSecretPassword);

export default router;
