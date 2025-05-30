import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/firebase";
import { uploadToDrive, deleteFromDrive } from "../config/googleDrive";

export const uploadImageSchema = Joi.object({
    categoryName: Joi.string().trim().min(1).required().messages({
        "string.empty": `"categoryName" tidak boleh kosong`,
        "any.required": `"categoryName" wajib diisi`,
    }),
});

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { categoryName } = req.body;
        const result = await uploadToDrive(req.file);

        const galleryDoc = await db.collection("gallery").add({
            name: result.name,
            url: result.webViewLink,
            driveId: result.id,
            uploadedAt: new Date(),
            category: categoryName,
        });

        res.status(200).json({
            success: true,
            data: {
                id: galleryDoc.id,
                name: result.name,
                url: result.webViewLink,
                driveId: result.id,
                category: categoryName,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Upload failed", detail: String(error) });
    }
};

export const getGallery = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const startAfterId = req.query.startAfter as string | undefined;

        let query = db.collection("gallery").orderBy("uploadedAt", "desc").limit(limit);

        if (startAfterId) {
            const lastDoc = await db.collection("gallery").doc(startAfterId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            } else {
                return res.status(400).json({ error: "startAfter id not found" });
            }
        }

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        if (data.length === 0) {
            return res.status(404).json({ message: "No images found" });
        }

        const snapshotCount = await db.collection("gallery").count().get();
        const totalCount = snapshotCount.data().count;

        res.status(200).json({
            success: true,
            data,
            totalCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch gallery data." });
    }
};

export const getGalleryOnePerCategory = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("gallery").get();

        const mapCategoryToDoc: Record<string, any> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const category = data.category;
            if (category && !mapCategoryToDoc[category]) {
                mapCategoryToDoc[category] = {
                    id: doc.id,
                    ...data
                };
            }
        });

        const result = Object.values(mapCategoryToDoc);

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch gallery data." });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "Image ID is required" });

        const docRef = db.collection("gallery").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) return res.status(404).json({ error: "Image not found" });

        const data = docSnap.data();
        if (!data?.driveId) return res.status(400).json({ error: "Drive ID missing in document" });

        await deleteFromDrive(data.driveId);
        await docRef.delete();

        res.status(200).json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete image", detail: String(error) });
    }
};