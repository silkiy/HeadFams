import e, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase";
import Joi from "joi";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}

export const validateSecretLogin = (data: any) => {
  const schema = Joi.object({
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password wajib diisi",
      "string.min": "Password minimal 6 karakter",
      "any.required": "Password wajib diisi",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validateSetSecretPassword = (data: any) => {
  const schema = Joi.object({
    password: Joi.string().min(8).required().messages({
      "string.empty": "Password wajib diisi",
      "string.min": "Password minimal 8 karakter",
      "any.required": "Password wajib diisi",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

export function getTokenExpiryCountdown(expiresInSeconds: number): { remainingSeconds: number; formatted: string } {
    const now = Date.now();
    const expiryTime = now + expiresInSeconds * 1000;

    const interval = setInterval(() => {
        const nowCheck = Date.now();
        const diffMs = expiryTime - nowCheck;
        if (diffMs <= 0) {
            clearInterval(interval);
        }
    }, 1000);

    const remainingMs = expiryTime - now;
    const remainingSeconds = Math.max(Math.floor(remainingMs / 1000), 0);

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formatted =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    return { remainingSeconds, formatted };
}

export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    try {
        const adminRef = db.collection("admins");
        const snapshot = await adminRef.where("email", "==", email).limit(1).get();
        if (snapshot.empty) {
            return res.status(401).json({ error: "Email atau password salah" });
        }

        const adminDoc = snapshot.docs[0];
        const adminData = adminDoc.data();

        const match = await bcrypt.compare(password, adminData.passwordHash);
        if (!match) {
            return res.status(401).json({ error: "Email atau password salah" });
        }

        const token = jwt.sign({ id: adminDoc.id, email, role: "admin" }, JWT_SECRET, {
            expiresIn: "12h",
        });

        const expiresInSeconds = 12 * 60 * 60;
        const countdown = getTokenExpiryCountdown(expiresInSeconds);

        res.status(200).json({
            success: true,
            email,
            token,
            expiresIn: countdown.remainingSeconds,
            expiresInFormatted: countdown.formatted,
            message: "Login berhasil",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login gagal" });
    }
};

export const secretLogin = async (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: "Password wajib diisi" });
    }

    try {
        const doc = await db.collection("secretAuth").doc("config").get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Password belum diatur oleh admin" });
        }

        const data = doc.data();
        const isMatch = await bcrypt.compare(password, data!.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Password salah" });
        }

        const token = jwt.sign({ role: "secret" }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            success: true,
            token,
            message: "Login berhasil ke laman rahasia",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal login" });
    }
};

export const setSecretPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password wajib diisi" });
    }

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await db.collection("secretAuth").doc("config").set({ passwordHash });

        res.status(200).json({ success: true, message: "Password laman rahasia berhasil disimpan" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal menyimpan password" });
    }
};

