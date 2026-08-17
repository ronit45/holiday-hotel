import mongoose from "mongoose";
import Hotel from "../../models/hotel";
import User from "../../models/user";
import Booking from "../../models/booking";
import { bookingService } from "../../services/booking.service";

async function createTestUser(overrides: Record<string, any> = {}) {
  const user = new User({
    email: `test-${Date.now()}@example.com`,
    password: "hashedPassword123",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  });
  await user.save();
  return user;
}

async function createTestHotel(userId: string, overrides: Record<string, any> = {}) {
  const hotel = new Hotel({
    userId,
    name: "Test Hotel",
    city: "London",
    country: "UK",
    description: "A lovely test hotel",
    type: ["Budget"],
    adultCount: 2,
    childCount: 1,
    facilities: ["Free WiFi"],
    pricePerNight: 100,
    starRating: 4,
    imageUrls: ["https://example.com/img.jpg"],
    lastUpdated: new Date(),
    ...overrides,
  });
  await hotel.save();
  return hotel;
}

async function createTestBooking(
  userId: string,
  hotelId: string,
  overrides: Record<string, any> = {}
) {
  const booking = new Booking({
    userId,
    hotelId,
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    adultCount: 2,
    childCount: 0,
    checkIn: new Date("2027-06-01"),
    checkOut: new Date("2027-06-05"),
    totalCost: 400,
    status: "confirmed",
    paymentStatus: "paid",
    ...overrides,
  });
  await booking.save();
  return booking;
}

describe("BookingService", () => {
  describe("createBooking", () => {
    it("should create a booking and update hotel + user analytics", async () => {
      const user = await createTestUser();
      const hotel = await createTestHotel(user._id.toString());

      const booking = await bookingService.createBooking({
        userId: user._id.toString(),
        hotelId: hotel._id.toString(),
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        adultCount: 2,
        childCount: 0,
        checkIn: new Date("2027-06-01"),
        checkOut: new Date("2027-06-05"),
        totalCost: 400,
      });

      expect(booking).toBeDefined();
      expect(booking._id).toBeDefined();
      expect(booking.totalCost).toBe(400);
    });
  });

  describe("getMyBookings", () => {
    it("should return bookings grouped by hotel", async () => {
      const user = await createTestUser();
      const hotel = await createTestHotel(user._id.toString());

      await createTestBooking(user._id.toString(), hotel._id.toString());
      await createTestBooking(user._id.toString(), hotel._id.toString(), {
        checkIn: new Date("2027-07-01"),
        checkOut: new Date("2027-07-05"),
      });

      const results = await bookingService.getMyBookings(user._id.toString());

      expect(results).toHaveLength(2); 
      expect(results[0]).toHaveProperty("name", "Test Hotel");
      expect(results[0]).toHaveProperty("bookings");
      expect(results[0]!.bookings).toHaveLength(1);
    });

    it("should return empty array when no bookings exist", async () => {
      const user = await createTestUser();
      const results = await bookingService.getMyBookings(user._id.toString());
      expect(results).toHaveLength(0);
    });
  });

  describe("isCancellable", () => {
    it("should return true for future pending booking", () => {
      const result = bookingService.isCancellable({
        status: "pending",
        checkIn: new Date("2099-01-01"),
      });
      expect(result).toBe(true);
    });

    it("should return false for past booking", () => {
      const result = bookingService.isCancellable({
        status: "confirmed",
        checkIn: new Date("2020-01-01"),
      });
      expect(result).toBe(false);
    });
  });

  describe("updateBookingStatus", () => {
    it("should update the status of a booking", async () => {
      const user = await createTestUser();
      const hotel = await createTestHotel(user._id.toString());
      const booking = await createTestBooking(
        user._id.toString(),
        hotel._id.toString()
      );

      const updated = await bookingService.updateBookingStatus(
        booking._id.toString(),
        "completed"
      );

      expect(updated!.status).toBe("completed");
    });
  });
});
