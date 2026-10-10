import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import { config } from "./config/env.js";
import { corsMiddleware } from "./config/cors.js";
import { helmetMiddleware, generalLimiter, paymentLimiter } from "./config/security.js";

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import myHotelRoutes from "./routes/my-hotels.js";
import hotelRoutes from "./routes/hotels.js";
import bookingRoutes from "./routes/my-bookings.js";
import bookingsManagementRoutes from "./routes/bookings.js";

const app = express();

app.use(corsMiddleware);
app.options("*", corsMiddleware);

app.use(helmetMiddleware);
app.set("trust proxy", 1);
if (config.env !== "test") {
  app.use("/api/", generalLimiter);
  app.use("/api/hotels/*/bookings/payment-intent", paymentLimiter);
  app.use(morgan("combined"));
}

app.use(compression());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

app.get("/", (req, res) => res.send("<h1>Hotel Booking Backend API is running 🚀</h1>"));
app.get("/api/health", (req, res) => res.send());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/bookings", bookingsManagementRoutes);
app.use((err, req, res, next) => {
  if (config.env !== "test") {
    console.error("=========================================");
    console.error(`🚨 [ERROR] ${req.method} ${req.url}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    if (Object.keys(req.body || {}).length > 0) {
      console.error(`   Body:`, req.body);
    }
    console.error("=========================================");
  }

  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    message: "Something went wrong on the server",
    error: config.env === "development" ? err.message : undefined,
  });
});

export default app;
