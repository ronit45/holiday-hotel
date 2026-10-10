import express from "express";
import mongoose from "mongoose";
import verifyToken from "../middleware/auth.js";
import { hotelService } from "../services/hotel.service.js";
import { bookingService } from "../services/booking.service.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  res.json(await hotelService.searchHotels(req.query, parseInt(req.query.page || "1"), req.query.sortOption));
});

router.get("/", async (req, res) => {
  res.json(await hotelService.getAllHotels(false, 0));
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Hotel ID is required" });
  
  const hotel = await hotelService.getHotelById(id);
  hotel ? res.json(hotel) : res.status(404).json({ message: "Hotel not found" });
});

router.post("/:hotelId/bookings", verifyToken, async (req, res) => {
  const { checkIn, checkOut } = req.body;
  if (checkIn && checkOut && !(await bookingService.checkAvailability(req.params.hotelId, checkIn, checkOut))) {
    return res.status(400).json({ message: "Sorry, these dates are no longer available." });
  }

  await bookingService.createBooking({
    ...req.body,
    userId: req.userId,
    hotelId: req.params.hotelId,
    createdAt: new Date(),
    status: "pending",
    paymentStatus: "pending",
  });
  res.status(200).send();
});

export default router;
