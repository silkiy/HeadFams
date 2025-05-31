import bcrypt from "bcrypt";
import { db } from "./config/firebase";

async function createAdmin(email: string, plainPassword: string) {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const docRef = await db.collection("admins").add({
      email,
      passwordHash,
      createdAt: new Date(),
    });

    console.log(`Admin created with id: ${docRef.id}`);
  } catch (error) {
    console.error("Failed to create admin:", error);
  }
}

createAdmin("headfams276@gmail.com", "MahesNgewe77");
