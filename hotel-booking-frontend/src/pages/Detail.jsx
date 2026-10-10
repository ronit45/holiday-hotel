import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import GuestInfoForm from "../forms/GuestInfoForm";
import { AiFillStar } from "react-icons/ai";
import { MapPin, Building, Check } from "lucide-react";

const Detail = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);

  useEffect(() => { if (hotelId) apiClient.fetchHotelById(hotelId).then(setHotel).catch(() => setHotel(null)); }, [hotelId]);

  if (hotel === null) return <div className="animate-pulse space-y-4"><div className="h-8 w-64 bg-gray-200 rounded"/><div className="h-64 bg-gray-100 rounded"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex text-yellow-400 mb-2">{Array(hotel.starRating).fill().map((_,i) => <AiFillStar key={i} />)}</div>
          <h1 className="text-3xl font-bold text-gray-800">{hotel.name}</h1>
          <p className="text-gray-600 flex items-center gap-1 mt-1 font-medium"><MapPin className="w-4 h-4"/> {hotel.city}, {hotel.country}</p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-100 font-bold text-lg"><Building className="w-5 h-5 inline mr-1"/> £{hotel.pricePerNight} / night</div>
      </div>

      {hotel.imageUrls?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hotel.imageUrls.map((img, i) => <img key={i} src={img} className="rounded-lg object-cover w-full h-64 border shadow-sm" alt={hotel.name} />)}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">About this hotel</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{hotel.description}</p>
          </div>
          {hotel.facilities?.length > 0 && (
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.facilities.map(f => <span key={f} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded border font-medium"><Check className="w-4 h-4 text-green-600"/> {f}</span>)}
              </div>
            </div>
          )}
        </div>
        <div className="h-fit sticky top-20">
          <GuestInfoForm pricePerNight={hotel.pricePerNight} hotelId={hotel._id} />
        </div>
      </div>
    </div>
  );
};
export default Detail;
