import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const requiredEnvVars = [
  "MONGODB_CONNECTION_STRING",
  "JWT_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_API_KEY",
] as const;

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
  process.exit(1);
}

const PORT = process.env.PORT || 5001;

export const config = {
  env: process.env.NODE_ENV || "development",
  port: PORT,
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5174").replace(/\/$/, ""),
  backendUrl: (process.env.BACKEND_URL || `http://localhost:${PORT}`).replace(/\/$/, ""),
  mongo: {
    uri: process.env.MONGODB_CONNECTION_STRING as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY as string,
  },
  stripe: {
    secretKey: process.env.STRIPE_API_KEY as string,
  },
  google: {
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
  },
  ai: {
    assistEnabled: process.env.AI_ASSIST_ENABLED === "true",
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL,
  },
} as const;

// Setup Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
