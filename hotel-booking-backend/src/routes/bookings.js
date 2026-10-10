import express from "express";
import verifyToken from "../middleware/auth.js";
import { bookingService } from "../services/booking.service.js";
import Hotel from "../models/hotel.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/hotel/:hotelId", verifyToken, async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });

  if (hotel.userId !== req.userId && (await User.findById(req.userId))?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.status(200).json(await bookingService.getBookingsByHotelId(req.params.hotelId));
});

router.post("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const reason = typeof req.body?.cancellationReason === "string" ? req.body.cancellationReason.trim() : "";
    res.status(200).json(await bookingService.cancelBooking(req.params.id, req.userId, user?.role || "user", reason));
  } catch (error) {
    const msg = error.message;
    if (msg === "Booking not found") return res.status(404).json({ message: msg });
    if (msg === "Access denied") return res.status(403).json({ message: msg });
    if (msg.includes("cannot be cancelled")) return res.status(400).json({ message: msg });
    throw error;
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const hotel = await Hotel.findById(booking.hotelId);
  const isGuest = String(booking.userId) === req.userId;
  const isOwner = hotel && String(hotel.userId) === req.userId;
  
  if (!isGuest && !isOwner && (await User.findById(req.userId))?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.status(200).json(booking);
});

export default router;
