import { google } from "googleapis";
import { Readable } from "stream";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
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
    fields: "id, name, webViewLink, webContentLink",
  });

  if (!response.data || !response.data.id) throw new Error("Upload failed, no response data");

  // Make the file public
  await driveService.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  // Construct a direct link (using 'uc' endpoint for direct view)
  // webViewLink is the preview page, webContentLink is for download (often with prompts).
  // The most reliable for img tags is often https://drive.google.com/uc?export=view&id=FILE_ID
  const directLink = `https://drive.google.com/thumbnail?id=${response.data.id}&sz=s3000`;

  return {
    id: response.data.id!,
    name: response.data.name || "Untitled",
    webViewLink: directLink,
    webContentLink: response.data.webContentLink || "",
  };
};

export const deleteFromDrive = async (fileId: string) => {
  if (!fileId) throw new Error("File ID is required for deletion");

  try {
    await driveService.files.delete({
      fileId,
    });
  } catch (error) {
    console.error("Failed to delete file from Drive:", error);
    throw error;
  }
};
