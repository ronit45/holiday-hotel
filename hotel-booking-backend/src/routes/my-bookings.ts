import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { bookingService } from "../services/booking.service";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const validResults = await bookingService.getMyBookings(req.userId);
    res.status(200).send(validResults);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
