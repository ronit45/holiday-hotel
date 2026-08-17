import { describe, it, expect, beforeEach } from "vitest";
import {
  extractHotelPlaces,
  clearHotelPlacesCache,
  readHotelPlacesCache,
  writeHotelPlacesCache,
  HOTEL_PLACES_STORAGE_KEY,
  HOTEL_PLACES_TIME_KEY,
} from "../hotel-places";

describe("hotel-places utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("extractHotelPlaces", () => {
    it("should extract cities and places distinctly", () => {
      const hotels = [
        { city: "London" },
        { place: "Paris" }, // Fallback to place
        { city: "London", place: "Somewhere" }, // City takes precedence
        { city: "Berlin" },
        {}, // Ignored
      ];
      
      const places = extractHotelPlaces(hotels);
      expect(places).toEqual(["London", "Paris", "Berlin"]);
    });
  });

  describe("cache functions", () => {
    it("writeHotelPlacesCache should write to localStorage", () => {
      writeHotelPlacesCache(["London", "Paris"]);
      expect(localStorage.getItem(HOTEL_PLACES_STORAGE_KEY)).toBe('["London","Paris"]');
      expect(localStorage.getItem(HOTEL_PLACES_TIME_KEY)).toBeDefined();
    });

    it("readHotelPlacesCache should read from localStorage if not expired", () => {
      const now = Date.now();
      localStorage.setItem(HOTEL_PLACES_STORAGE_KEY, '["London","Paris"]');
      localStorage.setItem(HOTEL_PLACES_TIME_KEY, now.toString());
      
      const cached = readHotelPlacesCache();
      expect(cached).toEqual(["London", "Paris"]);
    });

    it("readHotelPlacesCache should return null if expired", () => {
      // 6 minutes ago (TTL is 5 minutes)
      const past = Date.now() - 6 * 60 * 1000;
      localStorage.setItem(HOTEL_PLACES_STORAGE_KEY, '["London","Paris"]');
      localStorage.setItem(HOTEL_PLACES_TIME_KEY, past.toString());
      
      const cached = readHotelPlacesCache();
      expect(cached).toBeNull();
    });

    it("clearHotelPlacesCache should clear keys from localStorage", () => {
      localStorage.setItem(HOTEL_PLACES_STORAGE_KEY, '["London","Paris"]');
      localStorage.setItem(HOTEL_PLACES_TIME_KEY, Date.now().toString());
      
      clearHotelPlacesCache();
      
      expect(localStorage.getItem(HOTEL_PLACES_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(HOTEL_PLACES_TIME_KEY)).toBeNull();
    });
  });
});
