import { useQueryWithLoading } from "../useLoadingHooks";
import * as apiClient from "../../api-client";
import type { HotelWithBookingsType } from "../../../../shared/types";
import useAppContext from "../useAppContext";

export const useMyBookings = () => {
  const { isLoggedIn } = useAppContext();

  const query = useQueryWithLoading<HotelWithBookingsType[]>(
    "fetchMyBookings",
    apiClient.fetchMyBookings,
    {
      loadingMessage: "Loading your bookings...",
      enabled: isLoggedIn,
    }
  );

  const hotels = query.data;

  // Calculate booking statistics
  const totalBookings = hotels?.reduce(
    (total: number, hotel: HotelWithBookingsType) => total + hotel.bookings.length,
    0
  ) || 0;

  // Count unique hotels by hotel ID
  const uniqueHotelIds = new Set(hotels?.map((hotel: HotelWithBookingsType) => hotel._id) || []);
  const differentHotels = uniqueHotelIds.size;

  // Calculate total spent across all bookings
  const totalSpent = hotels?.reduce((total: number, hotel: HotelWithBookingsType) => {
    return (
      total +
      hotel.bookings.reduce((hotelTotal: number, booking: any) => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const nights = Math.max(
          1,
          Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        return hotelTotal + hotel.pricePerNight * nights;
      }, 0)
    );
  }, 0) || 0;

  return {
    ...query,
    isLoggedIn,
    stats: {
      totalBookings,
      differentHotels,
      totalSpent,
    }
  };
};
