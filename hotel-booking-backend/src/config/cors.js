import cors from "cors";
import { config } from "./env.js";

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:5174",
  "http://localhost:5173",
  "https://mern-booking-hotel.netlify.app",
  "https://mern-booking-hotel.netlify.app/",
  "https://hotel-mern-booking.vercel.app",
  "https://hotel-mern-booking.vercel.app/",
].filter((origin) => Boolean(origin));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow only this project's Netlify/Vercel preview deploys (not any arbitrary subdomain)
    const isProjectPreview =
      /^https:\/\/[a-z0-9-]+--mern-booking-hotel\.netlify\.app$/.test(origin) ||
      /^https:\/\/hotel-mern-booking(-[a-z0-9]+)?\.vercel\.app$/.test(origin);
    if (isProjectPreview) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log blocked origins in development
    if (config.env === "development") {
      console.log("CORS blocked origin:", origin);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
};

export const corsMiddleware = cors(corsOptions);
