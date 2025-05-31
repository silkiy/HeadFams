import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
}

interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({
            message: "You do not have permission to access this section.",
            success: false,
            code: 101,
        });

    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: not an admin" });
        }
        (req as any).admin = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};

export const authenticateSecret = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "You do not have permission to access this section.",
            success: false,
            code: 101,
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded.role !== "secret") {
            return res.status(403).json({ error: "Forbidden: not authorized for secret area" });
        }
        (req as any).secret = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};