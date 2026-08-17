import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async () => {
  try {
    console.log("📡 Attempting to connect to MongoDB...");
    const uri = config.mongo.uri;
    const wantsTls =
      uri.includes("mongodb+srv://") ||
      /[?&]tls=true/i.test(uri) ||
      /[?&]ssl=true/i.test(uri);

    await mongoose.connect(uri, {
      ...(wantsTls
        ? {
            tls: true,
            tlsAllowInvalidCertificates: false,
          }
        : {}),
    });
    console.log("✅ MongoDB connected successfully");
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    if (wantsTls) {
      console.log("🔒 MongoDB TLS enabled");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("💡 Please check your MONGODB_CONNECTION_STRING");
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected successfully");
});
