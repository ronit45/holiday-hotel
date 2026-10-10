import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Users } from "lucide-react";
import * as apiClient from "../api-client";
import SearchBar from "../components/SearchBar";
import PageContainer from "../components/PageContainer";

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await apiClient.fetchHotels();
        setHotels(data);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHotels();
  }, []);

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 py-6">
        <PageContainer>
          <SearchBar />
        </PageContainer>
      </div>

      <PageContainer className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Latest Destinations
          </h2>
          <p className="text-gray-600 mt-2">
            Most recent destinations added by our hosts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <p className="text-center col-span-full">Loading hotels...</p>
          ) : (
            hotels?.map((hotel) => (
              <LatestDestinationCard key={hotel._id} hotel={hotel} />
            ))
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default Home;



const LatestDestinationCard = ({ hotel }) => {
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      apiClient.fetchHotelById(hotel._id).catch(() => {});
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  return (
    <Link
      to={`/detail/${hotel._id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white hover:bg-gray-50 transition-colors w-full h-full"
    >
      <div className="h-48 w-full bg-gray-100 shrink-0">
        <img
          src={hotel.imageUrls[0]}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-medium text-gray-900 line-clamp-1">{hotel.name}</h3>
          <span className="font-medium text-gray-900 shrink-0">£{hotel.pricePerNight}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span className="truncate">{hotel.city}, {hotel.country}</span>
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {hotel.averageRating && hotel.averageRating > 0
                ? hotel.averageRating.toFixed(1)
                : "New"}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{hotel.adultCount}A</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

