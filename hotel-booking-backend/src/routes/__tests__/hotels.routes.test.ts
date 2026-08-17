import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import Hotel from "../../models/hotel";

describe("Public Hotel Routes", () => {
  beforeEach(async () => {
    // Insert some test hotels
    await Hotel.create([
      {
        userId: new mongoose.Types.ObjectId().toString(),
        name: "Grand London Hotel",
        city: "London",
        country: "UK",
        description: "Luxury hotel in London",
        type: ["Luxury"],
        adultCount: 2,
        childCount: 1,
        facilities: ["Free WiFi", "Spa"],
        pricePerNight: 200,
        starRating: 5,
        imageUrls: ["https://example.com/london.jpg"],
        lastUpdated: new Date(),
        isActive: true,
      },
      {
        userId: new mongoose.Types.ObjectId().toString(),
        name: "Budget Paris Inn",
        city: "Paris",
        country: "France",
        description: "Affordable stay in Paris",
        type: ["Budget"],
        adultCount: 1,
        childCount: 0,
        facilities: ["Free WiFi"],
        pricePerNight: 50,
        starRating: 2,
        imageUrls: ["https://example.com/paris.jpg"],
        lastUpdated: new Date(),
        isActive: true,
      },
    ]);
  });

  describe("GET /api/hotels/search", () => {
    it("should return all active hotels when no query is provided", async () => {
      const res = await request(app).get("/api/hotels/search");
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it("should filter hotels by destination", async () => {
      const res = await request(app).get("/api/hotels/search?destination=London");
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Grand London Hotel");
    });

    it("should filter hotels by star rating", async () => {
      const res = await request(app).get("/api/hotels/search?stars=5");
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Grand London Hotel");
    });
  });

  describe("GET /api/hotels/:id", () => {
    it("should return hotel details by valid ID", async () => {
      const hotels = await Hotel.find();
      const hotelId = hotels[0]._id.toString();

      const res = await request(app).get(`/api/hotels/${hotelId}`);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(hotels[0].name);
    });

    it("should return 400 for invalid Object ID", async () => {
      const res = await request(app).get(`/api/hotels/invalid-id`);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Hotel ID is required");
    });

    it("should return 404 for non-existent valid Object ID", async () => {
      const randomId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/hotels/${randomId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Hotel not found");
    });
  });
});
