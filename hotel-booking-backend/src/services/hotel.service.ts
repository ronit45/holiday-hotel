import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import { HotelType } from "../../../shared/types";

export interface HotelSearchQuery {
  destination?: string;
  adultCount?: string;
  childCount?: string;
  facilities?: string | string[];
  types?: string | string[];
  stars?: string | string[];
  maxPrice?: string;
}

class HotelService {
  buildSearchQuery(queryParams: HotelSearchQuery) {
    let constructedQuery: any = {};

    if (queryParams.destination && queryParams.destination.trim() !== "") {
      const destination = queryParams.destination.trim();
      constructedQuery.$or = [
        { city: { $regex: destination, $options: "i" } },
        { country: { $regex: destination, $options: "i" } },
      ];
    }

    if (queryParams.adultCount) {
      constructedQuery.adultCount = {
        $gte: parseInt(queryParams.adultCount),
      };
    }

    if (queryParams.childCount) {
      constructedQuery.childCount = {
        $gte: parseInt(queryParams.childCount),
      };
    }

    if (queryParams.facilities) {
      constructedQuery.facilities = {
        $all: Array.isArray(queryParams.facilities)
          ? queryParams.facilities
          : [queryParams.facilities],
      };
    }

    if (queryParams.types) {
      constructedQuery.type = {
        $in: Array.isArray(queryParams.types)
          ? queryParams.types
          : [queryParams.types],
      };
    }

    if (queryParams.stars) {
      const starRatings = Array.isArray(queryParams.stars)
        ? queryParams.stars.map((star: string) => parseInt(star))
        : parseInt(queryParams.stars as string);

      constructedQuery.starRating = { $in: starRatings };
    }

    if (queryParams.maxPrice) {
      constructedQuery.pricePerNight = {
        $lte: parseInt(queryParams.maxPrice).toString(),
      };
    }

    return constructedQuery;
  }

  async searchHotels(queryParams: HotelSearchQuery, pageNumber: number, sortOption?: string) {
    const query = this.buildSearchQuery(queryParams);

    let sortOptions = {};
    switch (sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    return {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  async getAllHotels() {
    return await Hotel.find().sort("-lastUpdated");
  }

  async getHotelById(id: string) {
    return await Hotel.findById(id);
  }

  async getMyHotels(userId: string) {
    const hotels = await Hotel.find({ userId });
    const hotelIds = hotels.map((h) => h._id.toString());

    if (hotelIds.length === 0) {
      return [];
    }

    const [allBookings, reviewAggs] = await Promise.all([
      Booking.find({ hotelId: { $in: hotelIds } }).select(
        "hotelId status checkIn checkOut"
      ),
      Review.aggregate([
        { $match: { hotelId: { $in: hotelIds } } },
        {
          $group: {
            _id: "$hotelId",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const bookingsByHotel = new Map<string, typeof allBookings>();
    for (const b of allBookings) {
      const list = bookingsByHotel.get(b.hotelId) || [];
      list.push(b);
      bookingsByHotel.set(b.hotelId, list);
    }

    const reviewByHotel = new Map(
      reviewAggs.map((r) => [
        r._id as string,
        {
          averageRating: Math.round((r.averageRating as number) * 10) / 10,
          reviewCount: r.reviewCount as number,
        },
      ])
    );

    const enriched = hotels.map((hotel) => {
      const id = hotel._id.toString();
      const counts = this.classifyBookingCounts(bookingsByHotel.get(id) || []);
      const review = reviewByHotel.get(id);
      const obj = hotel.toObject();
      return {
        ...obj,
        upcomingBookings: counts.upcoming,
        completedBookings: counts.completed,
        cancelledBookings: counts.cancelled,
        averageRating:
          review?.averageRating ?? obj.averageRating ?? obj.starRating ?? 0,
        reviewCount: review?.reviewCount ?? obj.reviewCount ?? 0,
      };
    });

    return enriched;
  }

  private classifyBookingCounts(
    bookings: Array<{ status: string; checkIn: Date; checkOut: Date }>
  ) {
    const now = new Date();
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    for (const b of bookings) {
      if (b.status === "cancelled" || b.status === "refunded") {
        cancelled += 1;
      } else if (
        b.status === "completed" ||
        new Date(b.checkOut).getTime() < now.getTime()
      ) {
        completed += 1;
      } else {
        upcoming += 1;
      }
    }
    return { upcoming, completed, cancelled };
  }

  async getMyHotelById(id: string, userId: string) {
    return await Hotel.findOne({ _id: id, userId });
  }

  async createHotel(hotelData: HotelType) {
    const hotel = new Hotel(hotelData);
    await hotel.save();
    return hotel;
  }

  async updateHotel(id: string, userId: string, updateData: Partial<HotelType>) {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );
    return hotel;
  }

  async toggleHotelActive(id: string, isActive: boolean, userId?: string) {
    // If userId is provided, it's an owner updating their own hotel.
    // If userId is undefined, it's an admin updating any hotel.
    const query = userId ? { _id: id, userId } : { _id: id };
    const hotel = await Hotel.findOneAndUpdate(
      query,
      { isActive, lastUpdated: new Date() },
      { new: true }
    );
    return hotel;
  }
}

export const hotelService = new HotelService();
