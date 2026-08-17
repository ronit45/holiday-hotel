import { MapPin, Building } from "lucide-react";
import type { HotelWithBookingsType } from "../../../../shared/types";
import { SafeImage } from "../ui/safe-image";
import { BookingCard } from "./BookingCard";

interface BookingGroupProps {
  hotel: HotelWithBookingsType;
}

export const BookingGroup = ({ hotel }: BookingGroupProps) => {
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Hotel Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex items-start gap-6">
          <div className="relative">
            <SafeImage
              src={hotel.imageUrls[0]}
              alt={hotel.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-xl object-cover object-center shadow-xl"
            />
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
              {hotel.averageRating && hotel.averageRating > 0
                ? hotel.averageRating.toFixed(1)
                : "New"}
              ★
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg md:text-2xl font-medium text-gray-700 mb-2">
              {hotel.name}
            </h2>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {hotel.city}, {hotel.country}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                <span>£{hotel.pricePerNight}/night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="p-6">
        <div className="space-y-6">
          {hotel.bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              hotelId={hotel._id}
              hotelPricePerNight={hotel.pricePerNight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
