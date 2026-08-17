import { vi } from "vitest";
import { QueryClient } from "react-query";
import {
  invalidateBusinessInsightsQueries,
  invalidateHotelQueries,
  invalidateBookingQueries,
  invalidateReviewQueries,
  invalidateAdminQueries,
} from "../invalidate-queries";
import * as hotelPlaces from "../hotel-places";

describe("invalidate-queries", () => {
  let queryClient: QueryClient;
  let invalidateSpy: import("vitest").MockInstance;

  beforeEach(() => {
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries").mockImplementation();
    vi.spyOn(hotelPlaces, "clearHotelPlacesCache").mockImplementation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invalidateBusinessInsightsQueries calls correct keys", async () => {
    await invalidateBusinessInsightsQueries(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith("business-insights-dashboard");
    expect(invalidateSpy).toHaveBeenCalledWith("business-insights-forecast");
    expect(invalidateSpy).toHaveBeenCalledWith("business-insights-ops");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchAdminBusinessInsightsDashboard");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchBusinessInsightsRollups");
  });

  it("invalidateHotelQueries calls correct keys and drops soft cache", async () => {
    await invalidateHotelQueries(queryClient);
    expect(hotelPlaces.clearHotelPlacesCache).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith("fetchMyHotels");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchQuery");
    // also calls insights
    expect(invalidateSpy).toHaveBeenCalledWith("business-insights-dashboard");
  });

  it("invalidateBookingQueries calls correct keys", async () => {
    await invalidateBookingQueries(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith("fetchMyBookings");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchHotelBookings");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchAdminBookings");
    // chains to hotel
    expect(invalidateSpy).toHaveBeenCalledWith("fetchQuery");
  });

  it("invalidateReviewQueries calls correct keys", async () => {
    await invalidateReviewQueries(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith("fetchHotelReviews");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchAdminReviews");
    // chains to hotel
    expect(invalidateSpy).toHaveBeenCalledWith("fetchQuery");
  });

  it("invalidateAdminQueries calls correct keys", async () => {
    await invalidateAdminQueries(queryClient);
    expect(invalidateSpy).toHaveBeenCalledWith("fetchAdminUsers");
    expect(invalidateSpy).toHaveBeenCalledWith("fetchCurrentUser");
    // chains to hotel
    expect(invalidateSpy).toHaveBeenCalledWith("fetchQuery");
  });
});
