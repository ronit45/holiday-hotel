import { Link } from "react-router-dom";
import { HotelType } from "../../../shared/types";
import { AiFillStar, AiOutlineHeart } from "react-icons/ai";
import { MapPin, Check } from "lucide-react";
import { SafeImage } from "./ui/safe-image";

type Props = {
  hotel: HotelType;
};

const SearchResultsCard = ({ hotel }: Props) => {
  // Simulate original price (strike-through)
  const originalPrice = Math.round(hotel.pricePerNight * 1.2);
  const taxesAndFees = Math.round(hotel.pricePerNight * 0.18); // Simulate taxes
  
  // Convert numerical rating to text
  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.0) return "Good";
    return "Average";
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-[280px]">
      {/* 1. Image Section (Left) */}
      <div className="relative w-full md:w-[280px] shrink-0 h-64 md:h-full overflow-hidden">
        <SafeImage
          src={hotel.imageUrls[0]}
          alt={hotel.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Wishlist Heart Icon */}
        <div className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 cursor-pointer transition-colors z-10">
          <AiOutlineHeart className="w-5 h-5 text-white" />
        </div>

        {/* Photos Count Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-12">
          <div className="flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full py-1 px-3 w-max mx-auto text-white text-xs font-medium border border-white/20">
            {hotel.imageUrls.length} Photos & Videos
          </div>
        </div>
      </div>

      {/* 2. Details Section (Middle) */}
      <div className="flex-1 p-5 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Link
                to={`/detail/${hotel._id}`}
                className="text-xl md:text-[22px] leading-tight font-black text-gray-900 hover:text-blue-600 transition-colors truncate block"
              >
                {hotel.name}
              </Link>
              <div className="flex text-yellow-400 shrink-0">
                {Array.from({ length: hotel.starRating || 0 }).map((_, index) => (
                  <AiFillStar key={index} className="w-4 h-4" />
                ))}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-blue-600 font-bold mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.city}, {hotel.country}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-1 rounded font-bold uppercase tracking-wide">
            Couple Friendly
          </span>
          {Array.isArray(hotel.type) ? (
            hotel.type.slice(0, 2).map((type) => (
              <span key={type} className="bg-gray-100 text-gray-700 text-[11px] px-2 py-1 rounded font-bold uppercase tracking-wide">
                {type}
              </span>
            ))
          ) : (
            hotel.type && (
              <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-1 rounded font-bold uppercase tracking-wide">
                {hotel.type}
              </span>
            )
          )}
        </div>

        {/* Inclusions (Derived from facilities for demo) */}
        <div className="space-y-1.5 mt-auto">
          <div className="flex items-start text-[13px] font-medium text-emerald-600">
            <Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <span>Free Cancellation till 24 hrs before check in</span>
          </div>
          <div className="flex items-start text-[13px] font-medium text-emerald-600">
            <Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <span>Book with £0 Payment</span>
          </div>
          {hotel.facilities && hotel.facilities.slice(0, 1).map(fac => (
            <div key={fac} className="flex items-start text-[13px] font-medium text-emerald-600">
              <Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>Includes {fac}</span>
            </div>
          ))}
        </div>
        
        {/* Short Semantic Description */}
        <div className="text-xs text-gray-600 mt-4 flex items-center bg-blue-50/50 rounded p-2.5 border border-blue-100 min-w-0">
           <span className="italic truncate leading-relaxed block w-full">"{hotel.description}"</span>
        </div>
      </div>

      {/* 3. Pricing Section (Right) */}
      <div className="w-full md:w-[260px] shrink-0 p-5 flex flex-col justify-between bg-[#fcfcfc]">
        {/* Rating Block */}
        <div className="flex justify-end mb-4">
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[#001b94] text-[15px]">
                {hotel.averageRating ? getRatingText(hotel.averageRating) : "New"}
              </span>
              <div className="bg-[#001b94] text-white font-bold text-sm px-2 py-1 rounded-md flex items-center justify-center min-w-[32px]">
                {hotel.averageRating ? hotel.averageRating.toFixed(1) : "-"}
              </div>
            </div>
            {hotel.reviewCount ? (
              <span className="text-[11px] font-bold text-gray-500">
                ({hotel.reviewCount} Ratings)
              </span>
            ) : null}
          </div>
        </div>

        {/* Price Block */}
        <div className="mt-auto text-right flex flex-col justify-end">
           <div className="text-gray-400 text-[13px] font-medium line-through mb-1">
              £ {originalPrice}
           </div>
           <div className="text-[28px] font-black text-gray-900 mb-0.5 leading-none tracking-tight">
             £ {hotel.pricePerNight}
           </div>
           <div className="text-[12px] text-gray-500 mb-1">
             + £ {taxesAndFees} taxes & fees
           </div>
           <div className="text-[11px] font-medium text-gray-500 mb-4">
             Per Night
           </div>

           <Link
              to={`/detail/${hotel._id}`}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-2.5 px-4 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all text-center text-sm shadow-sm hover:shadow-md"
            >
              Login to Book Now
           </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsCard;
