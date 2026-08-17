import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { param, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { hotelService, HotelSearchQuery } from "../services/hotel.service";
import { paymentService } from "../services/payment.service";
import { bookingService } from "../services/booking.service";
import { BookingType } from "../../../shared/types";

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
    const sortOption = req.query.sortOption as string | undefined;

    const response = await hotelService.searchHotels(req.query as unknown as HotelSearchQuery, pageNumber, sortOption);
    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await hotelService.getAllHotels();
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/**
 * Admin: toggle hotel isActive.
 * PATCH /api/hotels/:id/active
 * Body: { isActive: boolean }
 */
router.patch(
  "/:id/active",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    if (typeof req.body?.isActive !== "boolean") {
      return res.status(400).json({ message: "isActive boolean required" });
    }
    try {
      const hotel = await hotelService.toggleHotelActive(req.params.id, req.body.isActive);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update hotel status" });
    }
  }
);

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    // Check if valid object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Hotel ID is required" }); // Matching the test expectation
    }

    try {
      const hotel = await hotelService.getHotelById(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    try {
      const hotel = await hotelService.getHotelById(hotelId);
      if (!hotel) {
        return res.status(400).json({ message: "Hotel not found" });
      }

      const totalCost = hotel.pricePerNight * numberOfNights;

      const paymentIntent = await paymentService.createPaymentIntent(
        totalCost,
        "gbp",
        { hotelId, userId: req.userId }
      );

      if (!paymentIntent.client_secret) {
        return res.status(500).json({ message: "Error creating payment intent" });
      }

      const response = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.toString(),
        totalCost,
      };

      res.send(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await paymentService.retrievePaymentIntent(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBookingData = {
        ...req.body,
        userId: req.userId,
        hotelId: req.params.hotelId,
        createdAt: new Date(),
        status: "confirmed" as const,
        paymentStatus: "paid" as const,
        stripePaymentIntentId: paymentIntent.id,
      };

      await bookingService.createBooking(newBookingData);

      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

export default router;
