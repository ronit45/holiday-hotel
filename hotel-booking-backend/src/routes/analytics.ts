import express, { Request, Response } from "express";
import Analytics from "../models/analytics";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { analyticsService } from "../services/analytics.service";

const router = express.Router();

/**
 * List recent business-insights rollups (admin).
 * Mounted under /api/business-insights — avoids /analytics path (ad-blockers).
 * GET /api/business-insights/rollups
 */
router.get(
  "/rollups",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || "20"), 10), 50);
      const snapshots = await Analytics.find()
        .sort({ date: -1 })
        .limit(limit);
      res.json(snapshots);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch business insights rollups" });
    }
  }
);

/**
 * Capture a live rollup into Analytics model (admin).
 * POST /api/business-insights/rollups
 */
router.post(
  "/rollups",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const payload = await analyticsService.buildLiveSnapshot();
      const snapshot = await Analytics.create(payload);
      res.status(201).json(snapshot);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to create business insights rollup" });
    }
  }
);

export default router;
