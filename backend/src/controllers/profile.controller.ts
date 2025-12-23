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

const PROFILE_COLLECTION = "profiles";

export const getProfiles = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection(PROFILE_COLLECTION).orderBy("createdAt", "desc").get();
        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                ...docData,
                photoUrl: docData.driveId ? `https://drive.google.com/thumbnail?id=${docData.driveId}&sz=s3000` : docData.photoUrl
            };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Get Profiles Error:", error);
        res.status(500).json({ error: "Gagal mengambil data profil" });
    }
};

export const createProfile = async (req: Request, res: Response) => {
    try {
        const { name, bio, instagram } = req.body;

        const { error } = profileSchema.validate({ name, bio, instagram });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Foto profil wajib diupload" });
        }

        const uploadResult = await uploadToDrive(req.file);

        const newProfile = {
            name,
            bio,
            instagram,
            photoUrl: uploadResult.webViewLink,
            driveId: uploadResult.id,
            photoName: uploadResult.name,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db.collection(PROFILE_COLLECTION).add(newProfile);

        res.status(201).json({
            success: true,
            message: "Profil berhasil dibuat",
            data: {
                id: docRef.id,
                ...newProfile,
                photoUrl: `https://drive.google.com/thumbnail?id=${uploadResult.id}&sz=s3000`
            }
        });

    } catch (error) {
        console.error("Create Profile Error:", error);
        res.status(500).json({ error: "Gagal membuat profil" });
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, bio, instagram } = req.body;

        // Basic validation
        const { error } = profileSchema.validate({ name, bio, instagram });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const docRef = db.collection(PROFILE_COLLECTION).doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: "Profil tidak ditemukan" });
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

            // Delete old photo
            const oldData = docSnap.data();
            if (oldData?.driveId) {
                await deleteFromDrive(oldData.driveId).catch(err => console.error("Failed to delete old image:", err));
            }
        }

        await docRef.set(updateData, { merge: true });

        // helper to return the correct URL in response immediately
        if (updateData.driveId) {
            updateData.photoUrl = `https://drive.google.com/thumbnail?id=${updateData.driveId}&sz=s3000`;
        } else {
            // preserve old url if no new file
            const currentData = docSnap.data();
            if (currentData?.driveId) {
                updateData.photoUrl = `https://drive.google.com/thumbnail?id=${currentData.driveId}&sz=s3000`;
            }
        }

        res.status(200).json({ success: true, message: "Profil berhasil diperbarui", data: { id, ...updateData } });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Gagal memperbarui profil" });
    }
};

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(PROFILE_COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: "Profil tidak ditemukan" });
        }

        const data = docSnap.data();
        if (data?.driveId) {
            await deleteFromDrive(data.driveId).catch(err => console.error("Failed to delete image from drive:", err));
        }

        await docRef.delete();

        res.status(200).json({ success: true, message: "Profil berhasil dihapus" });
    } catch (error) {
        console.error("Delete Profile Error:", error);
        res.status(500).json({ error: "Gagal menghapus profil" });
    }
};
