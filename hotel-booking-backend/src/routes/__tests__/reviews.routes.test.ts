import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import Review from "../../models/review";
import Hotel from "../../models/hotel";
import Booking from "../../models/booking";
import User from "../../models/user";
import jwt from "jsonwebtoken";

const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" });
};

describe("Reviews Routes", () => {
  let token: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let hotelId: string;
  let bookingId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: "user",
    });
    userId = user.id;
    token = createToken(userId);

    const admin = await User.create({
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    adminId = admin.id;
    adminToken = createToken(adminId);

    const hotel = await Hotel.create({
      userId,
      name: "Test Hotel",
      city: "Test City",
      country: "Test Country",
      description: "Test Description",
      type: "Budget",
      adultCount: 2,
      childCount: 1,
      facilities: ["Free WiFi"],
      pricePerNight: 100,
      starRating: 4,
      imageUrls: ["test1.jpg"],
      lastUpdated: new Date(),
    });
    hotelId = hotel.id;

    const booking = await Booking.create({
      userId,
      hotelId,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      adultCount: 2,
      childCount: 0,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      totalCost: 100,
      status: "completed",
    });
    bookingId = booking.id;
  });

  describe("POST /api/reviews", () => {
    it("should allow a user to submit a review for their completed booking", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Cookie", [`session_id=${token}`])
        .send({
          bookingId,
          hotelId,
          rating: 5,
          comment: "Great stay!",
          categories: { cleanliness: 5, service: 5, location: 5, value: 5, amenities: 5 },
        });

      expect(response.status).toBe(201);
      const review = await Review.findOne({ bookingId });
      expect(review).not.toBeNull();
      expect(review?.rating).toBe(5);
    });

    it("should prevent duplicate reviews", async () => {
      await Review.create({
        userId,
        hotelId,
        bookingId,
        rating: 4,
        comment: "Nice",
        categories: { cleanliness: 4, service: 4, location: 4, value: 4, amenities: 4 },
      });

      const response = await request(app)
        .post("/api/reviews")
        .set("Cookie", [`session_id=${token}`])
        .send({
          bookingId,
          hotelId,
          rating: 5,
          comment: "Another review",
          categories: { cleanliness: 5, service: 5, location: 5, value: 5, amenities: 5 },
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  describe("GET /api/reviews/hotel/:id", () => {
    it("should return public reviews for a hotel", async () => {
      await Review.create({
        userId,
        hotelId,
        bookingId,
        rating: 4,
        comment: "Public review",
        categories: { cleanliness: 4, service: 4, location: 4, value: 4, amenities: 4 },
      });

      const response = await request(app).get(`/api/reviews/hotel/${hotelId}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].comment).toBe("Public review");
    });
  });
});
