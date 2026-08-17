import { Calendar, Users, CreditCard, Phone, Package, Building } from "lucide-react";
import { Badge } from "../ui/badge";
import type { BookingType } from "../../../../shared/types";
import CancelBookingButton from "../CancelBookingButton";
import WriteReviewForm from "../WriteReviewForm";
import { getStatusColor, getStatusIcon, getPaymentStatusColor } from "../../lib/booking-utils";

interface BookingCardProps {
  booking: BookingType;
  hotelId: string;
  hotelPricePerNight: number;
}

export const BookingCard = ({ booking, hotelId, hotelPricePerNight }: BookingCardProps) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const createdAt = new Date(booking.createdAt || booking.checkIn);
  
  const nights = Math.max(
    1,
    Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  
  const totalPrice = hotelPricePerNight * nights;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-200">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${getStatusColor(booking.status || "pending")}`}>
            {getStatusIcon(booking.status || "pending")}
          </div>
          <div>
            <h3 className="font-medium text-gray-700">
              Booking #{booking._id.slice(-8).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-500">
              Booked on {createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`${getStatusColor(booking.status || "pending")} border`}>
            {getStatusIcon(booking.status || "pending")}
            <span className="ml-1">{booking.status || "pending"}</span>
          </Badge>
          <Badge className={`${getPaymentStatusColor(booking.paymentStatus || "pending")} border`}>
            {booking.paymentStatus || "pending"}
          </Badge>
          {booking.paymentMethod && (
            <Badge variant="outline" className="border-gray-300">
              {booking.paymentMethod}
            </Badge>
          )}
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dates */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">Stay Dates</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="mb-1">
              <span className="font-medium">Check-in:</span>{" "}
              {checkInDate.toDateString()}
            </div>
            <div>
              <span className="font-medium">Check-out:</span>{" "}
              {checkOutDate.toDateString()}
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-700">Guests</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="mb-1">
              <span className="font-medium">{booking.adultCount}</span> Adults
            </div>
            <div>
              <span className="font-medium">{booking.childCount}</span> Children
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-700">Contact</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="mb-1">{booking.email}</div>
            {booking.phone && <div>{booking.phone}</div>}
          </div>
        </div>

        {/* Pricing */}
        {totalPrice > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-gray-700">Pricing</span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="mb-1">
                <span className="font-medium">{nights}</span> Nights
              </div>
              <div className="text-lg font-medium text-green-600">
                £{totalPrice}
              </div>
              {booking.refundAmount !== undefined &&
                booking.refundAmount !== null &&
                booking.refundAmount > 0 && (
                  <div className="text-sm text-red-600">
                    Refund: £{booking.refundAmount}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Special Requests & Cancellation */}
      {(booking.specialRequests || booking.cancellationReason) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {booking.specialRequests && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Special Requests
              </h4>
              <p className="text-blue-700 text-sm">
                {booking.specialRequests}
              </p>
            </div>
          )}
          {booking.cancellationReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Cancellation Reason
              </h4>
              <p className="text-red-700 text-sm">
                {booking.cancellationReason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cancel upcoming stay */}
      <CancelBookingButton booking={booking} className="mt-4" />

      {/* Review after stay */}
      {(booking.status === "completed" ||
        (checkOutDate < new Date() &&
          booking.status !== "cancelled" &&
          booking.status !== "refunded")) && (
        <div className="mt-4">
          <WriteReviewForm hotelId={hotelId} bookingId={booking._id} />
        </div>
      )}
    </div>
  );
};
