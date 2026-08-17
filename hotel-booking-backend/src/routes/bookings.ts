import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { bookingService } from "../services/booking.service";
import Hotel from "../models/hotel";
import User from "../models/user";

const router = express.Router();

// Get all bookings (admin only)
router.get("/", verifyToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Get bookings by hotel ID (for hotel owners)
router.get(
  "/hotel/:hotelId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.userId !== req.userId) {
        const user = await User.findById(req.userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const bookings = await bookingService.getBookingsByHotelId(hotelId);
      res.status(200).json(bookings);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

/**
 * Cancel booking (guest / hotel owner / admin).
 * Full Stripe refund when paid + stripePaymentIntentId present.
 * POST /api/bookings/:id/cancel
 */
router.post(
  "/:id/cancel",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.userId);
      const userRole = user?.role || "user";
      const cancellationReason = typeof req.body?.cancellationReason === "string"
        ? req.body.cancellationReason.trim()
        : "";

      const result = await bookingService.cancelBooking(
        req.params.id,
        req.userId,
        userRole,
        cancellationReason
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.log(error);
      const msg = error.message;
      if (msg === "Booking not found") return res.status(404).json({ message: msg });
      if (msg === "Access denied") return res.status(403).json({ message: msg });
      if (msg.includes("cannot be cancelled")) return res.status(400).json({ message: msg });
      res.status(500).json({ message: "Unable to cancel booking" });
    }
  }
);

// Get booking by ID
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    const isGuest = String(booking.userId) === req.userId;
    const isOwner = hotel && String(hotel.userId) === req.userId;
    let isAdmin = false;
    
    if (!isGuest && !isOwner) {
      const user = await User.findById(req.userId);
      isAdmin = user?.role === "admin";
    }

    if (!isGuest && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

// Update booking status (owner / admin only)
router.patch(
  "/:id/status",
  verifyToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = await bookingService.getBookingById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const hotel = await Hotel.findById(existing.hotelId);
      const isOwner = hotel && String(hotel.userId) === req.userId;
      let isAdmin = false;
      if (!isOwner) {
        const user = await User.findById(req.userId);
        isAdmin = user?.role === "admin";
      }

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, cancellationReason } = req.body;

      // Force Stripe/refund path — do not allow silent cancel via PATCH
      if (status === "cancelled" || status === "refunded") {
        return res.status(400).json({
          message: "Use POST /api/bookings/:id/cancel for cancel/refund",
        });
      }

      const booking = await bookingService.updateBookingStatus(
        req.params.id,
        status,
        cancellationReason
      );

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

// Update payment status (owner / admin only)
router.patch(
  "/:id/payment",
  verifyToken,
  [
    body("paymentStatus")
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Invalid payment status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = await bookingService.getBookingById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const hotel = await Hotel.findById(existing.hotelId);
      const isOwner = hotel && String(hotel.userId) === req.userId;
      let isAdmin = false;
      if (!isOwner) {
        const user = await User.findById(req.userId);
        isAdmin = user?.role === "admin";
      }

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { paymentStatus, paymentMethod } = req.body;

      const booking = await bookingService.updatePaymentStatus(
        req.params.id,
        paymentStatus,
        paymentMethod
      );

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

// Delete booking (admin only)
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const booking = await bookingService.deleteBooking(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to delete booking" });
    }
  }
);

export default router;
