import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import { config } from "./config/env";
import { corsMiddleware } from "./config/cors";
import { helmetMiddleware, generalLimiter, paymentLimiter } from "./config/security";
import { specs } from "./swagger";

import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";
import bookingsManagementRoutes from "./routes/bookings";
import healthRoutes from "./routes/health";
import businessInsightsRoutes from "./routes/business-insights";
import reviewRoutes from "./routes/reviews";
import analyticsRoutes from "./routes/analytics";
import aiRoutes from "./routes/ai";

const app = express();

app.use(corsMiddleware);
app.options("*", corsMiddleware);

app.use(helmetMiddleware);
app.set("trust proxy", 1);
if (config.env !== 'test') {
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

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hotel Booking Backend API is running 🚀</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/bookings", bookingsManagementRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/business-insights", businessInsightsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/business-insights", analyticsRoutes);
app.use("/api/ai", aiRoutes);

if (config.env !== 'test') {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Hotel Booking API Documentation",
    })
  );
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (config.env !== 'test') {
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
    error: config.env === "development" ? err.message : undefined
  });
});

export default app;
