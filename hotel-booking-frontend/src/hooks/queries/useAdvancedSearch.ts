import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useSearchContext from "../../hooks/useSearchContext";
import { useQueryWithLoading } from "../../hooks/useLoadingHooks";
import * as apiClient from "../../api-client";

export const useAdvancedSearch = () => {
  const [urlSearchParams] = useSearchParams();
  const search = useSearchContext();
  
  const [page, setPage] = useState<number>(1);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>("");

  // Sync URL params to search context when navigating with query string
  useEffect(() => {
    const destination = urlSearchParams.get("destination");
    const checkIn = urlSearchParams.get("checkIn");
    const checkOut = urlSearchParams.get("checkOut");
    const adultCount = urlSearchParams.get("adultCount");
    const childCount = urlSearchParams.get("childCount");
    
    if (checkIn && checkOut) {
      search.saveSearchValues(
        destination || "",
        new Date(checkIn),
        new Date(checkOut),
        parseInt(adultCount || "1", 10),
        parseInt(childCount || "1", 10),
      );
    }
  }, [urlSearchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchParams = {
    destination: search.destination?.trim() || "",
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  const { data: hotelData, isLoading: isSearchLoading } = useQueryWithLoading(
    ["searchHotels", searchParams],
    () => apiClient.searchHotels(searchParams),
    {
      loadingMessage: "Searching for perfect hotels...",
    },
  );

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating),
    );
    setPage(1);
  };

  const handleHotelTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((hotel) => hotel !== hotelType),
    );
    setPage(1);
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const facility = event.target.value;
    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility),
    );
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value === "default" ? "" : value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedStars([]);
    setSelectedHotelTypes([]);
    setSelectedFacilities([]);
    setSelectedPrice(undefined);
    setSortOption("");
    setPage(1);
  };

  return {
    hotelData,
    isSearchLoading,
    searchContext: search,
    filters: {
      page,
      setPage,
      selectedStars,
      handleStarsChange,
      selectedHotelTypes,
      handleHotelTypeChange,
      selectedFacilities,
      handleFacilityChange,
      selectedPrice,
      setSelectedPrice,
      sortOption,
      handleSortChange,
      clearFilters,
    },
  };
};
