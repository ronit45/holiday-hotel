import mongoose from "mongoose";
import Booking from "../../models/booking";
import Hotel from "../../models/hotel";
import { analyticsService } from "../../services/analytics.service";

describe("AnalyticsService", () => {
  describe("buildLiveSnapshot", () => {
    it("should aggregate data across the database", async () => {
      const hotel = new Hotel({
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

      const booking = new Booking({
        userId: new mongoose.Types.ObjectId().toString(),
        hotelId: hotel._id.toString(),
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        adultCount: 2,
        childCount: 0,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // +1 day
        totalCost: 150,
        status: "confirmed",
        paymentStatus: "paid",
      });
      await booking.save();

      const snapshot = await analyticsService.buildLiveSnapshot();
      
      expect(snapshot.metrics.totalBookings).toBeGreaterThanOrEqual(1);
      expect(snapshot.metrics.totalRevenue).toBeGreaterThanOrEqual(150);
      expect(snapshot.metrics.totalHotels).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getDashboardData", () => {
    it("should return detailed dashboard analytics", async () => {
      const data = await analyticsService.getDashboardData();
      
      expect(data).toHaveProperty("overview");
      expect(data.overview).toHaveProperty("totalBookings");
      expect(data.overview).toHaveProperty("totalRevenue");
      expect(data).toHaveProperty("popularDestinations");
    });
  });
});
