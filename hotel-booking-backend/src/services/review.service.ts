import Review from "../models/review";
import Hotel from "../models/hotel";
import Booking from "../models/booking";

export class ReviewService {
  async getGlobalReviews(limit: number = 100) {
    return await Review.find().sort({ createdAt: -1 }).limit(limit);
  }

  async getHotelReviews(hotelId: string, limit: number = 100) {
    return await Review.find({ hotelId }).sort({ createdAt: -1 }).limit(limit);
  }

  async getHotelReviewSummary(hotelId: string) {
    const [agg] = await Review.aggregate([
      { $match: { hotelId } },
      {
        $group: {
          _id: "$hotelId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    return {
      hotelId,
      averageRating: agg ? Math.round((agg.averageRating as number) * 10) / 10 : 0,
      reviewCount: agg?.reviewCount ?? 0,
    };
  }

  async createReview(
    userId: string,
    hotelId: string,
    bookingId: string,
    rating: number,
    comment: string,
    categories: any
  ) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      hotelId,
    });
    if (!booking) {
      throw new Error("Booking not found for this user/hotel");
    }

    const existing = await Review.findOne({ bookingId, userId });
    if (existing) {
      throw new Error("Review already exists for this booking");
    }

    const review = new Review({
      userId,
      hotelId,
      bookingId,
      rating,
      comment,
      categories,
      isVerified: booking.paymentStatus === "paid",
    });
    await review.save();

    // Keep hotel document averages in sync for public listings
    const [agg] = await Review.aggregate([
      { $match: { hotelId } },
      {
        $group: {
          _id: "$hotelId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    
    if (agg) {
      hotel.averageRating = Math.round((agg.averageRating as number) * 10) / 10;
      hotel.reviewCount = agg.reviewCount as number;
      await hotel.save();
    }

    return review;
  }
}

export const reviewService = new ReviewService();
