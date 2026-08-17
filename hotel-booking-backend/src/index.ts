import mongoose from "mongoose";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import app from "./app";

console.log("✅ All required environment variables are present");
console.log(`🌍 Environment: ${config.env}`);
console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
console.log(`🔗 Backend URL: ${config.backendUrl}`);
console.log("☁️  Cloudinary configured successfully");

// Connect to Database
connectDB();

const server = app.listen(config.port, () => {
  console.log("🚀 ============================================");
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`🌐 Local: http://localhost:${config.port}`);
  console.log(`🔗 Public: ${config.backendUrl}`);
  console.log(`📚 API Docs: ${config.backendUrl}/api-docs`);
  console.log(`💚 Health Check: ${config.backendUrl}/api/health`);
  console.log("🚀 ============================================");
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔒 HTTP server closed");

    try {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed");
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
