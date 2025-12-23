import { Request, Response } from "express";
import { db } from "../config/firebase";
import { uploadToDrive, deleteFromDrive } from "../config/googleDrive";
import Joi from "joi";

// Schema for validation
const profileSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Nama wajib diisi",
        "any.required": "Nama wajib diisi",
    }),
    bio: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
});

const PROFILE_COLLECTION = "profile";
const MAIN_DOC_ID = "main";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const doc = await db.collection(PROFILE_COLLECTION).doc(MAIN_DOC_ID).get();
        if (!doc.exists) {
            // Default empty profile
            return res.status(200).json({
                success: true,
                data: {
                    name: "",
                    bio: "",
                    instagram: "",
                    photoUrl: ""
                }
            });
        }
        const data = doc.data() || {};

        // Format URL using driveId if available for better resolution/access
        if (data.driveId) {
            data.photoUrl = `https://drive.google.com/thumbnail?id=${data.driveId}&sz=s3000`;
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Gagal mengambil data profil" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, bio, instagram } = req.body;

        // Basic validation
        const { error } = profileSchema.validate({ name, bio, instagram });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let updateData: any = {
            name,
            bio,
            instagram,
            updatedAt: new Date()
        };

        // Handle File Upload
        if (req.file) {
            const uploadResult = await uploadToDrive(req.file);
            updateData.photoUrl = uploadResult.webViewLink;
            updateData.driveId = uploadResult.id;
            updateData.photoName = uploadResult.name;

            // Optional: Delete old photo if exists to save space
            const oldDoc = await db.collection(PROFILE_COLLECTION).doc(MAIN_DOC_ID).get();
            if (oldDoc.exists) {
                const oldData = oldDoc.data();
                if (oldData?.driveId) {
                    // Don't fail the request if delete fails, just log it
                    await deleteFromDrive(oldData.driveId).catch(err => console.error("Failed to delete old image:", err));
                }
            }
        }

        await db.collection(PROFILE_COLLECTION).doc(MAIN_DOC_ID).set(updateData, { merge: true });

        // helper to return the correct URL in response immediately
        if (updateData.driveId) {
            updateData.photoUrl = `https://drive.google.com/thumbnail?id=${updateData.driveId}&sz=s3000`;
        }

        res.status(200).json({ success: true, message: "Profil berhasil diperbarui", data: updateData });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Gagal memperbarui profil" });
    }
};
