import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/firebase";
import { uploadToDrive } from "../config/googleDrive";

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

export const getGallery = async (_req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("gallery").get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(data);
    } catch (error) {
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
