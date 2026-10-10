import express from "express";
import verifyToken from "../middleware/auth.js";
import { bookingService } from "../services/booking.service.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => res.status(200).send(await bookingService.getMyBookings(req.userId)));

export default router;
