import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    description: { type: String, required: true },

    adultCount: { type: Number, required: true },
    childCount: { type: Number, required: true },
    facilities: [{ type: String, required: true }],
    pricePerNight: { type: Number, required: true, index: true },
    starRating: { type: Number, required: true, min: 1, max: 5, index: true },
    imageUrls: [{ type: String, required: true }],
    lastUpdated: { type: Date, required: true },
    // Remove embedded bookings - we'll use separate collection
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Add compound indexes for better query performance
hotelSchema.index({ city: 1, starRating: 1 });
hotelSchema.index({ pricePerNight: 1, starRating: 1 });
hotelSchema.index({ userId: 1, createdAt: -1 });

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
