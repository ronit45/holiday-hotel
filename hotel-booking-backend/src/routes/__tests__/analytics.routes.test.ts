import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import Analytics from "../../models/analytics";

const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" });
};

describe("Analytics Routes", () => {
  let adminToken: string;
  let guestToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      email: "admin-analytics@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    adminToken = createToken(admin.id);

    const guest = await User.create({
      email: "guest-analytics@example.com",
      password: "password123",
      firstName: "Guest",
      lastName: "User",
      role: "user",
    });
    guestToken = createToken(guest.id);

    await Analytics.create({
      date: new Date(),
      metrics: {
        totalBookings: 10,
        completedBookings: 8,
        cancelledBookings: 2,
        totalRevenue: 1000,
        refundedAmount: 100,
        activeHotels: 5,
        totalUsers: 20,
        cancellationRate: 20,
      }
    });
  });

  describe("GET /api/business-insights/system-stats/public", () => {
    it("should allow public access to system stats", async () => {
      const response = await request(app).get("/api/business-insights/system-stats/public");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("database.totalHotels");
    });
  });

  describe("GET /api/business-insights/dashboard", () => {
    it("should allow admin access to dashboard data", async () => {
      const response = await request(app)
        .get("/api/business-insights/dashboard")
        .set("Cookie", [`session_id=${adminToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("overview.totalRevenue");
    });

    it("should forbid guest access to dashboard data", async () => {
      const response = await request(app)
        .get("/api/business-insights/dashboard")
        .set("Cookie", [`session_id=${guestToken}`]);

      expect(response.status).toBe(403);
    });
  });
});
