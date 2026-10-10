import Hotel from "../models/hotel.js";
import Booking from "../models/booking.js";

class HotelService {
  buildSearchQuery(q) {
    const query = { isActive: { $ne: false } };
    if (q.destination?.trim()) {
      const dest = q.destination.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [{ city: new RegExp(dest, 'i') }, { country: new RegExp(dest, 'i') }];
    }
    if (q.adultCount) query.adultCount = { $gte: +q.adultCount };
    if (q.childCount) query.childCount = { $gte: +q.childCount };
    if (q.facilities) query.facilities = { $all: [].concat(q.facilities) };
    if (q.types) query.type = { $in: [].concat(q.types) };
    if (q.maxPrice) query.pricePerNight = { $lte: +q.maxPrice };
    if (q.stars) query.$and = [{ $or: [].concat(q.stars).map(s => ({ averageRating: { $gte: s - 0.5, $lt: s + 0.5 } })) }];
    return query;
  }

  async searchHotels(queryParams, pageNumber = 1, sortOption) {
    const query = this.buildSearchQuery(queryParams);

    if (queryParams.checkIn && queryParams.checkOut) {
      const booked = await Booking.find({
        checkIn: { $lt: new Date(queryParams.checkOut) },
        checkOut: { $gt: new Date(queryParams.checkIn) },
        status: { $ne: "cancelled" }
      }).select("hotelId");
      if (booked.length) query._id = { $nin: booked.map(b => b.hotelId) };
    }

    const sortMap = { starRating: { averageRating: -1 }, pricePerNightAsc: { pricePerNight: 1 }, pricePerNightDesc: { pricePerNight: -1 } };
    const pageSize = 5;
    const skip = (pageNumber - 1) * pageSize;

    const [data, total] = await Promise.all([
      Hotel.find(query).sort(sortMap[sortOption] || {}).skip(skip).limit(pageSize),
      Hotel.countDocuments(query)
    ]);
    return { data, pagination: { total, page: pageNumber, pages: Math.ceil(total / pageSize) } };
  }

  async getAllHotels(includeInactive = false, page = 1, limit = 50) {
    const query = includeInactive ? {} : { isActive: { $ne: false } };
    if (page === 0) return Hotel.find(query).sort("-lastUpdated");
    
    const [data, total] = await Promise.all([
      Hotel.find(query).sort("-lastUpdated").skip((page - 1) * limit).limit(limit),
      Hotel.countDocuments(query)
    ]);
    return { data, pagination: { total, page, pages: Math.ceil(total / limit) } };
  }

  getHotelById(id) { return Hotel.findById(id); }

  async getMyHotels(userId) {
    const hotels = await Hotel.find({ userId });
    if (!hotels.length) return [];

    const bookings = await Booking.find({ hotelId: { $in: hotels.map(h => h._id) } }).select("hotelId status checkOut");
    const bMap = bookings.reduce((m, b) => {
      (m[b.hotelId] = m[b.hotelId] || []).push(b);
      return m;
    }, {});

    const now = Date.now();
    return hotels.map(hotel => {
      const hotelBookings = bMap[hotel._id] || [];
      const counts = hotelBookings.reduce((c, b) => {
        if (b.status === "cancelled" || b.status === "refunded") c.cancelled++;
        else if (b.status === "completed" || new Date(b.checkOut).getTime() < now) c.completed++;
        else c.upcoming++;
        return c;
      }, { upcoming: 0, completed: 0, cancelled: 0 });

      return {
        ...hotel.toObject(), ...counts,
        averageRating: hotel.averageRating ?? hotel.starRating ?? 0,
        reviewCount: hotel.reviewCount ?? 0,
      };
    });
  }

  getMyHotelById(id, userId) { return Hotel.findOne({ _id: id, userId }); }
  
  async createHotel(hotelData) { return new Hotel(hotelData).save(); }
  
  updateHotel(id, userId, updateData) { return Hotel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true }); }
  
  toggleHotelActive(id, isActive, userId) {
    return Hotel.findOneAndUpdate(userId ? { _id: id, userId } : { _id: id }, { isActive, lastUpdated: new Date() }, { new: true });
  }
}

export const hotelService = new HotelService();
