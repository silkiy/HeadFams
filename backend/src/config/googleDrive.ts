import { google } from "googleapis";
import { Readable } from "stream";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const KEYFILEPATH = path.join(__dirname, "../../service-account.json");

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const driveService = google.drive({ version: "v3", auth });

export const uploadToDrive = async (file: Express.Multer.File) => {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID in .env");

    const fileMetadata = {
        name: file.originalname,
        parents: [folderId],
    };

    const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
    };

    const response = await driveService.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name, webViewLink",
    });

    if (!response.data) throw new Error("Upload failed, no response data");

    return response.data;
};
