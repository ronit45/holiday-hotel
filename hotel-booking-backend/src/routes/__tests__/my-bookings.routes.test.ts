import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import User from "../../models/user";
import Hotel from "../../models/hotel";
import Booking from "../../models/booking";

describe("My Bookings Routes", () => {
  let authToken: string;
  let userId: string;
  let hotelId: string;

  beforeEach(async () => {
    // Create a test user and login to get the token
    await request(app).post("/api/users/register").send({
      email: "traveler@example.com",
      password: "password123",
      firstName: "Traveler",
      lastName: "User",
    });
    
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "traveler@example.com",
      password: "password123",
    });

    authToken = loginRes.body.token;
    const user = await User.findOne({ email: "traveler@example.com" });
    userId = user!._id.toString();

    // Create a dummy hotel to book
    const hotel = await Hotel.create({
      userId: new mongoose.Types.ObjectId().toString(),
      name: "Booking Test Hotel",
      city: "Test City",
      country: "Test Country",
      description: "Test description",
      type: ["Resort"],
      adultCount: 2,
      childCount: 1,
      facilities: [],
      pricePerNight: 150,
      starRating: 4,
      imageUrls: ["https://example.com/img.jpg"],
      lastUpdated: new Date(),
      isActive: true,
    });
    hotelId = hotel._id.toString();
  });

  describe("GET /api/my-bookings", () => {
    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/my-bookings");
      expect(res.status).toBe(401);
    });

    it("should return empty array if user has no bookings", async () => {
      const res = await request(app)
        .get("/api/my-bookings")
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return the user's bookings", async () => {
      // Create a booking manually
      await Booking.create({
        userId,
        hotelId,
        firstName: "Traveler",
        lastName: "User",
        email: "traveler@example.com",
        adultCount: 2,
        childCount: 0,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // +1 day
        totalCost: 150,
        status: "confirmed",
        paymentStatus: "paid"
      });

      const res = await request(app)
        .get("/api/my-bookings")
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      // Depending on how getMyBookings groups them, we check the nested structure
      expect(res.body[0].bookings).toHaveLength(1);
    });
  });
});
