import mongoose from "mongoose";
import Hotel from "../../models/hotel";
import Booking from "../../models/booking";
import { hotelService } from "../../services/hotel.service";

async function createTestHotel(overrides: Record<string, any> = {}) {
  const hotel = new Hotel({
    userId: new mongoose.Types.ObjectId().toString(),
    name: "Test Hotel",
    city: "London",
    country: "UK",
    description: "A lovely test hotel",
    type: ["Budget"],
    adultCount: 2,
    childCount: 1,
    facilities: ["Free WiFi", "Pool"],
    pricePerNight: 100,
    starRating: 4,
    imageUrls: ["https://example.com/img.jpg"],
    lastUpdated: new Date(),
    isActive: true,
    ...overrides,
  });
  await hotel.save();
  return hotel;
}

describe("HotelService", () => {
  describe("searchHotels", () => {
    it("should return all active hotels when no query params provided", async () => {
      await createTestHotel();
      await createTestHotel({ name: "Another Hotel", city: "Paris" });

      const result = await hotelService.searchHotels({}, 1);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it("should filter by destination (city or country)", async () => {
      await createTestHotel({ name: "London Hotel", city: "London", country: "UK" });
      await createTestHotel({ name: "Paris Hotel", city: "Paris", country: "France" });

      const resultCity = await hotelService.searchHotels({ destination: "London" }, 1);
      expect(resultCity.data).toHaveLength(1);
      expect(resultCity.data[0].name).toBe("London Hotel");
    });
  });

  describe("toggleHotelActive", () => {
    it("should toggle isActive flag", async () => {
      const hotel = await createTestHotel({ isActive: true });
      
      const updated = await hotelService.toggleHotelActive(hotel._id.toString(), false);
      expect(updated!.isActive).toBe(false);

      const dbHotel = await Hotel.findById(hotel._id);
      expect(dbHotel!.isActive).toBe(false);
    });
  });
});
