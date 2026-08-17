import Booking, { IBooking } from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import { paymentService } from "./payment.service";

class BookingService {
  async getAllBookings() {
    return await Booking.find()
      .sort({ createdAt: -1 })
      .populate("hotelId", "name city country");
  }

  async getBookingsByHotelId(hotelId: string) {
    return await Booking.find({ hotelId })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName email");
  }

  async getMyBookings(userId: string) {
    const userBookings = await Booking.find({ userId }).sort({
      createdAt: -1,
    });

    const results = await Promise.all(
      userBookings.map(async (booking) => {
        const hotel = await Hotel.findById(booking.hotelId);
        if (!hotel) {
          return null;
        }

        return {
          ...hotel.toObject(),
          bookings: [booking.toObject()],
        };
      })
    );

    return results.filter((result) => result !== null);
  }

  async getBookingById(id: string) {
    return await Booking.findById(id).populate(
      "hotelId",
      "name city country imageUrls"
    );
  }

  async createBooking(bookingData: Partial<IBooking>) {
    const booking = new Booking(bookingData);
    await booking.save();

    // Update hotel analytics
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $inc: {
        totalBookings: 1,
        totalRevenue: booking.totalCost,
      },
    });

    // Update user analytics
    await User.findByIdAndUpdate(booking.userId, {
      $inc: {
        totalBookings: 1,
        totalSpent: booking.totalCost,
      },
    });

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string, userRole: string, cancellationReason: string = "") {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Authorization
    const hotel = await Hotel.findById(booking.hotelId);
    const isGuest = String(booking.userId) === userId;
    const isOwner = hotel && String(hotel.userId) === userId;
    const isAdmin = userRole === "admin";

    if (!isGuest && !isOwner && !isAdmin) {
      throw new Error("Access denied");
    }

    if (!this.isCancellable(booking)) {
      throw new Error("Booking cannot be cancelled (must be upcoming pending/confirmed)");
    }

    let refundAmount = 0;
    let refundSkipped: string | undefined;
    const wasPaid = booking.paymentStatus === "paid";

    if (wasPaid && booking.stripePaymentIntentId) {
      try {
        const refundAmt = await paymentService.refundPayment(booking.stripePaymentIntentId);
        refundAmount = refundAmt || booking.totalCost;
      } catch (stripeErr: any) {
        throw new Error(stripeErr.message || "Stripe refund failed");
      }
    } else if (wasPaid && !booking.stripePaymentIntentId) {
      refundSkipped = "Cancelled without Stripe refund (no payment intent on file)";
    }

    booking.status = "cancelled";
    if (wasPaid && booking.stripePaymentIntentId && refundAmount > 0) {
      booking.paymentStatus = "refunded";
      booking.refundAmount = refundAmount;
    } else if (wasPaid && !booking.stripePaymentIntentId) {
      booking.refundAmount = 0;
    }

    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    // Mirror create increments only when this booking had been counted as paid revenue
    if (wasPaid) {
      await Hotel.findByIdAndUpdate(booking.hotelId, {
        $inc: {
          totalBookings: -1,
          totalRevenue: -(booking.totalCost || 0),
        },
      });
      await User.findByIdAndUpdate(booking.userId, {
        $inc: {
          totalBookings: -1,
          totalSpent: -(booking.totalCost || 0),
        },
      });
    }

    return {
      booking,
      refundAmount,
      refundSkipped,
    };
  }

  async updateBookingStatus(id: string, status: string, cancellationReason?: string) {
    const updateData: Record<string, unknown> = { status };
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    return await Booking.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paymentMethod?: string) {
    const updateData: Record<string, unknown> = { paymentStatus };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    return await Booking.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteBooking(id: string) {
    const booking = await Booking.findByIdAndDelete(id);

    if (booking) {
      const alreadyAdjusted =
        booking.status === "cancelled" ||
        booking.status === "refunded" ||
        booking.paymentStatus === "refunded";

      if (!alreadyAdjusted) {
        await Hotel.findByIdAndUpdate(booking.hotelId, {
          $inc: {
            totalBookings: -1,
            totalRevenue: -(booking.totalCost || 0),
          },
        });

        await User.findByIdAndUpdate(booking.userId, {
          $inc: {
            totalBookings: -1,
            totalSpent: -(booking.totalCost || 0),
          },
        });
      }
    }

    return booking;
  }

  isCancellable(booking: { status?: string; checkIn: Date }): boolean {
    const status = booking.status || "pending";
    if (status !== "pending" && status !== "confirmed") return false;
    return new Date(booking.checkIn).getTime() > Date.now();
  }
}

export const bookingService = new BookingService();
