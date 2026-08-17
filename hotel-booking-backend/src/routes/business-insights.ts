import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { analyticsService } from "../services/analytics.service";

const router = express.Router();

/**
 * Public dashboard stats endpoint.
 * Limited to essential database counts so the frontend hero section
 * can show "trusted by X users" without exposing financial metrics.
 */
router.get("/dashboard/public", async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getDashboardData();
    res.json({
      overview: {
        totalHotels: data.overview.totalHotels,
        totalUsers: data.overview.totalUsers,
        totalBookings: data.overview.totalBookings,
        verifiedReviewCount: data.overview.verifiedReviewCount,
      },
    });
  } catch (error) {
    console.error("Error fetching public dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch public dashboard data" });
  }
});

// Public forecast data
router.get("/forecast/public", async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getForecastData();
    res.json(data);
  } catch (error) {
    console.error("Error fetching public forecast data:", error);
    res.status(500).json({ message: "Failed to fetch public forecast data" });
  }
});

// Public system stats data
router.get("/system-stats/public", async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getSystemStatsData();
    res.json(data);
  } catch (error) {
    console.error("Error fetching public system stats data:", error);
    res.status(500).json({ message: "Failed to fetch public system stats data" });
  }
});

// Admin-only comprehensive dashboard data
router.get(
  "/dashboard",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const data = await analyticsService.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  }
);

// Admin-only forecast data
router.get(
  "/forecast",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const data = await analyticsService.getForecastData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      res.status(500).json({ message: "Failed to fetch forecast data" });
    }
  }
);

// Admin-only detailed business stats
router.get(
  "/business-stats",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const data = await analyticsService.getBusinessStatsData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching business stats:", error);
      res.status(500).json({ message: "Failed to fetch business stats" });
    }
  }
);

// Admin-only system stats
router.get(
  "/system-stats",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const data = await analyticsService.getSystemStatsData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  }
);

export default router;
