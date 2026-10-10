import { TrendingUp, Clock, Building, Star, CreditCard } from "lucide-react";

/** Upcoming pending/confirmed — matches backend cancel rules */
export const isBookingCancellable = (booking) => {
  const status = booking.status || "pending";
  if (status !== "pending" && status !== "confirmed") return false;
  const checkInDate = new Date(booking.checkIn);
  checkInDate.setHours(23, 59, 59, 999);
  return checkInDate.getTime() > Date.now();
};

export const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "refunded":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return <TrendingUp className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
      return <Building className="w-4 h-4" />;
    case "completed":
      return <Star className="w-4 h-4" />;
    case "refunded":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};
