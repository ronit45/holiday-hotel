import { describe, it, expect } from "vitest";
import { isBookingCancellable, getStatusColor, getPaymentStatusColor } from "../booking-utils";
import type { BookingType } from "../../../../shared/types";

describe("booking-utils", () => {
  describe("isBookingCancellable", () => {
    it("should return true for pending bookings in the future", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const booking = {
        status: "pending",
        checkIn: futureDate.toISOString(),
      } as BookingType;

      expect(isBookingCancellable(booking)).toBe(true);
    });

    it("should return false for cancelled bookings", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const booking = {
        status: "cancelled",
        checkIn: futureDate.toISOString(),
      } as BookingType;

      expect(isBookingCancellable(booking)).toBe(false);
    });

    it("should return false for past bookings", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const booking = {
        status: "confirmed",
        checkIn: pastDate.toISOString(),
      } as BookingType;

      expect(isBookingCancellable(booking)).toBe(false);
    });
  });

  describe("getStatusColor", () => {
    it("should return green classes for confirmed", () => {
      expect(getStatusColor("confirmed")).toContain("bg-green-100");
    });
    it("should return red classes for cancelled", () => {
      expect(getStatusColor("cancelled")).toContain("bg-red-100");
    });
    it("should fallback to gray for unknown", () => {
      expect(getStatusColor("unknown_status")).toContain("bg-gray-100");
    });
  });

  describe("getPaymentStatusColor", () => {
    it("should return green classes for paid", () => {
      expect(getPaymentStatusColor("paid")).toContain("bg-green-100");
    });
    it("should return yellow classes for pending", () => {
      expect(getPaymentStatusColor("pending")).toContain("bg-yellow-100");
    });
  });
});
