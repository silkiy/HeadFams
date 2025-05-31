import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import Joi from "joi";

export const vCreateJanjiPria = Joi.object({
    description: Joi.string().min(3).max(5000).required().messages({
        "string.empty": "Description wajib diisi",
        "string.min": "Description minimal 3 karakter",
        "string.max": "Description maksimal 500 karakter",
    }),
});

export const vUpdateJanjiPria = Joi.object({
    description: Joi.string().min(3).max(5000),
    status: Joi.string().valid("pending", "approve", "rejected"),
});

export const createJanjiPria = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ error: "Description wajib diisi" });

        const now = Timestamp.now();

        const docRef = await db.collection("janjiPria").add({
            description,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        res.status(201).json({
            success: true, id:
                docRef.id, message:
                "Janji Pria berhasil dibuat",
        });
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ error: "Gagal membuat Janji Pria" });
    }
};

export const getApprovedJanjiPria = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db
            .collection("janjiPria")
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
        res.status(500).json({ error: "Gagal mengambil Janji Pria yang disetujui" });
    }
};

export const getAllJanjiPria = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db
            .collection("janjiPria")
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
        res.status(500).json({ error: "Gagal mengambil semua Janji Pria" });
    }
};

export const updateJanjiPria = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { description, status } = req.body;

    if (!id) {
        return res.status(400).json({ error: "ID janjiPria wajib disertakan" });
    }

    if (!description && !status) {
        return res.status(400).json({ error: "Setidaknya satu field harus diubah" });
    }

    const updateData: any = {};
    if (description) {
        updateData.description = description;
    }
    if (status) {
        const validStatuses = ["pending", "approve", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Status tidak valid" });
        }
        updateData.status = status;
    }

    updateData.updatedAt = Timestamp.now();

    try {
        const docRef = db.collection("janjiPria").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: "Data janjiPria tidak ditemukan" });
        }

        await docRef.update(updateData);

        res.status(200).json({
            success: true,
            message: "Janji Pria berhasil diperbarui",
            updatedFields: updateData,
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Gagal memperbarui Janji Pria" });
    }
};
