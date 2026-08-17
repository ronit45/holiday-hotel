import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { reviewService } from "../services/review.service";

const router = express.Router();

/**
 * Admin: global review list (newest first).
 * GET /api/reviews
 */
router.get(
  "/",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 200);
      const reviews = await reviewService.getGlobalReviews(limit);
      res.json(reviews);
    } catch {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  }
);

/**
 * Public: list reviews for a hotel (newest first).
 * GET /api/reviews/hotel/:hotelId
 */
router.get("/hotel/:hotelId", async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getHotelReviews(req.params.hotelId);
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

/**
 * Public: aggregate rating for a hotel.
 * GET /api/reviews/hotel/:hotelId/summary
 */
router.get("/hotel/:hotelId/summary", async (req: Request, res: Response) => {
  try {
    const summary = await reviewService.getHotelReviewSummary(req.params.hotelId);
    res.json(summary);
  } catch {
    res.status(500).json({ message: "Error fetching review summary" });
  }
});

/**
 * Authenticated: create a review for a completed/confirmed booking at a hotel.
 * POST /api/reviews
 */
router.post(
  "/",
  verifyToken,
  [
    body("hotelId").notEmpty(),
    body("bookingId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").notEmpty().isLength({ min: 3 }),
    body("categories.cleanliness").isInt({ min: 1, max: 5 }),
    body("categories.service").isInt({ min: 1, max: 5 }),
    body("categories.location").isInt({ min: 1, max: 5 }),
    body("categories.value").isInt({ min: 1, max: 5 }),
    body("categories.amenities").isInt({ min: 1, max: 5 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid review", errors: errors.array() });
    }

    try {
      const { hotelId, bookingId, rating, comment, categories } = req.body;

      const review = await reviewService.createReview(
        req.userId,
        hotelId,
        bookingId,
        rating,
        comment,
        categories
      );

      res.status(201).json(review);
    } catch (e: any) {
      if (e.message === "Hotel not found") return res.status(404).json({ message: e.message });
      if (e.message === "Booking not found for this user/hotel") return res.status(403).json({ message: e.message });
      if (e.message === "Review already exists for this booking") return res.status(409).json({ message: e.message });
      
      res.status(500).json({ message: "Error creating review" });
    }
  }
);

export default router;
