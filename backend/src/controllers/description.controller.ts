import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import Joi from "joi";

export const vCreateDescription = Joi.object({
    description: Joi.string().min(3).max(5000).required().messages({
        "string.empty": "Description wajib diisi",
        "string.min": "Description minimal 3 karakter",
        "string.max": "Description maksimal 500 karakter",
    }),
});

export const createDescription = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ error: "Description wajib diisi" });

        const now = Timestamp.now();

        const docRef = await db.collection("descriptions").add({
            description,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        res.status(201).json({
            success: true, id:
                docRef.id, message:
                "Deskripsi berhasil dibuat",
        });
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ error: "Gagal membuat deskripsi" });
    }
};

export const getApprovedDescriptions = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db
            .collection("descriptions")
            .where("status", "==", "approve")
            .orderBy("createdAt", "desc")
            .get();

        const formatter = new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Jakarta",
            timeZoneName: "short",
        });

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                description: docData.description,
                status: docData.status,
                createdAt: formatter.format(docData.createdAt.toDate()),
                updatedAt: formatter.format(docData.updatedAt.toDate()),
            };
        });

        res.status(200).json({
            success: true,
            total: data.length,
            data,
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Gagal mengambil deskripsi yang disetujui" });
    }
};

export const getAllDescriptions = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db
            .collection("descriptions")
            .orderBy("createdAt", "desc")
            .get();

        const formatter = new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Jakarta",
            timeZoneName: "short",
        });

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                description: docData.description,
                status: docData.status,
                createdAt: formatter.format(docData.createdAt.toDate()),
                updatedAt: formatter.format(docData.updatedAt.toDate()),
            };
        });

        res.status(200).json({
            success: true,
            total: data.length,
            data,
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Gagal mengambil semua deskripsi" });
    }
};