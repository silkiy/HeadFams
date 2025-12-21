import { google } from "googleapis";
import { Readable } from "stream";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const driveService = google.drive({ version: "v3", auth: oauth2Client });

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
    supportsAllDrives: true,
  });

  if (!response.data || !response.data.id) throw new Error("Upload failed, no response data");

  // Make the file public
  await driveService.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
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
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error("Failed to delete file from Drive:", error);
    throw error;
  }
};
