import mongoose from "mongoose";
import Review from "../../models/review";
import Hotel from "../../models/hotel";
import Booking from "../../models/booking";
import { reviewService } from "../../services/review.service";

describe("ReviewService", () => {
  describe("createReview", () => {
    it("should prevent duplicate reviews for the same booking", async () => {
      const hotelId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const bookingId = new mongoose.Types.ObjectId().toString();

      const booking = new Booking({
        _id: bookingId,
        hotelId,
        userId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        adultCount: 2,
        childCount: 0,
        checkIn: new Date("2020-01-01"),
        checkOut: new Date("2020-01-05"),
        totalCost: 100,
        status: "completed",
      });
      await booking.save();

      const hotel = new Hotel({
        _id: hotelId,
        userId: new mongoose.Types.ObjectId().toString(),
        name: "Test Hotel",
        city: "City",
        country: "Country",
        description: "Desc",
        type: ["Type"],
        adultCount: 2,
        childCount: 1,
        facilities: [],
        pricePerNight: 100,
        starRating: 4,
        imageUrls: [],
        lastUpdated: new Date(),
      });
      await hotel.save();

      await reviewService.createReview(
        userId,
        hotelId,
        bookingId,
        5,
        "Great!",
        { cleanliness: 5, service: 5, location: 5, value: 5, amenities: 5 }
      );

      await expect(
        reviewService.createReview(
          userId,
          hotelId,
          bookingId,
          4,
          "Second review",
          { cleanliness: 4, service: 4, location: 4, value: 4, amenities: 4 }
        )
      ).rejects.toThrow("Review already exists for this booking");
    });
  });

  describe("getHotelReviewSummary", () => {
    it("should calculate correct average rating for multiple reviews", async () => {
      const hotelId = new mongoose.Types.ObjectId().toString();

      await Review.create({
        hotelId,
        userId: new mongoose.Types.ObjectId().toString(),
        bookingId: new mongoose.Types.ObjectId().toString(),
        rating: 4,
        comment: "Good",
        isVerified: true,
        categories: { cleanliness: 4, service: 4, location: 4, value: 4, amenities: 4 }
      });

      await Review.create({
        hotelId,
        userId: new mongoose.Types.ObjectId().toString(),
        bookingId: new mongoose.Types.ObjectId().toString(),
        rating: 2,
        comment: "Bad",
        isVerified: true,
        categories: { cleanliness: 2, service: 2, location: 2, value: 2, amenities: 2 }
      });

      const summary = await reviewService.getHotelReviewSummary(hotelId);
      expect(summary.reviewCount).toBe(2);
      expect(summary.averageRating).toBe(3); // (4+2)/2
    });
  });
});
