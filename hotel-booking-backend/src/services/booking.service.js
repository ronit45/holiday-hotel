import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";

class BookingService {
  async checkAvailability(hotelId, checkIn, checkOut) {
    const overlap = await Booking.findOne({
      hotelId,
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
      status: { $ne: "cancelled" },
    });
    return !overlap;
  }

  getBookingsByHotelId(hotelId) { return Booking.find({ hotelId }).sort({ createdAt: -1 }); }
  getBookingById(id) { return Booking.findById(id); }
  createBooking(bookingData) { return new Booking(bookingData).save(); }

  async getMyBookings(userId) {
    const userBookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    const hotelIds = [...new Set(userBookings.map(b => b.hotelId.toString()))];
    const hotels = await Hotel.find({ _id: { $in: hotelIds } });
    
    const hotelMap = hotels.reduce((m, h) => (m[h._id.toString()] = { ...h.toObject(), bookings: [] }, m), {});
    userBookings.forEach(b => hotelMap[b.hotelId.toString()]?.bookings.push(b.toObject()));
    
    return Object.values(hotelMap);
  }

  async cancelBooking(bookingId, userId, userRole, cancellationReason = "") {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const hotel = await Hotel.findById(booking.hotelId);
    if (String(booking.userId) !== userId && (!hotel || String(hotel.userId) !== userId) && userRole !== "admin") {
      throw new Error("Access denied");
    }

    const checkIn = new Date(booking.checkIn).setHours(23, 59, 59, 999);
    if (!["pending", "confirmed"].includes(booking.status || "pending") || checkIn <= Date.now()) {
      throw new Error("Booking cannot be cancelled");
    }

    booking.status = "cancelled";
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    return { booking: await booking.save() };
  }
}

export const bookingService = new BookingService();
