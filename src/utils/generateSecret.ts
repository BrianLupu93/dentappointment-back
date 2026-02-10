import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";

const envFilePath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
}

interface Env {
  JWT_SECRET?: string;
}

const env: Env = process.env as Env;

if (!env.JWT_SECRET) {
  const newSecret = crypto.randomBytes(32).toString("hex");

  let envContent = "";
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, "utf-8");
  }

  envContent += `\nJWT_SECRET=${newSecret}\n`;
  fs.writeFileSync(envFilePath, envContent, "utf-8");

  console.log("✅ JWT_SECRET generated and saved");
} else {
  console.log("ℹ️ JWT_SECRET exist in .env");
}
