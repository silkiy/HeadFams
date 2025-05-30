import { Request, Response } from "express";
import { db } from "../config/firebase";
import { uploadToDrive } from "../config/googleDrive";

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadToDrive(req.file);

        const galleryDoc = await db.collection("gallery").add({
            name: result.name,
            url: result.webViewLink,
            driveId: result.id,
            uploadedAt: new Date(),
        });

        res.status(200).json({
            success: true,
            data: {
                id: galleryDoc.id,
                name: result.name,
                url: result.webViewLink,
                driveId: result.id,
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
