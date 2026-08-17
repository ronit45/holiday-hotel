import StarRatingFilter from "../StarRatingFilter";
import HotelTypesFilter from "../HotelTypesFilter";
import FacilitiesFilter from "../FacilitiesFilter";
import PriceFilter from "../PriceFilter";
import { useAdvancedSearch } from "../../hooks/queries/useAdvancedSearch";

type SearchFiltersProps = ReturnType<typeof useAdvancedSearch>["filters"];

export const SearchFiltersSidebar = ({
  selectedStars,
  handleStarsChange,
  selectedHotelTypes,
  handleHotelTypeChange,
  selectedFacilities,
  handleFacilityChange,
  selectedPrice,
  setSelectedPrice,
}: SearchFiltersProps) => {
  return (
    <div className="rounded-xl border border-slate-300 p-5 h-fit lg:sticky lg:top-10 order-2 lg:order-1">
      <div className="space-y-5">
        <h3 className="text-lg font-medium border-b border-slate-300 pb-5">
          Filter by:
        </h3>
        <StarRatingFilter
          selectedStars={selectedStars}
          onChange={handleStarsChange}
        />
        <HotelTypesFilter
          selectedHotelTypes={selectedHotelTypes}
          onChange={handleHotelTypeChange}
        />
        <FacilitiesFilter
          selectedFacilities={selectedFacilities}
          onChange={handleFacilityChange}
        />
        <PriceFilter
          selectedPrice={selectedPrice}
          onChange={(value?: number) => setSelectedPrice(value)}
        />
      </div>
    </div>
  );
};
