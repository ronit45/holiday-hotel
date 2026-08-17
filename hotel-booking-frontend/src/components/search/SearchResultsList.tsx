import { HotelSearchResponse } from "../../../../shared/types";
import SearchResultsCard from "../SearchResultsCard";
import Pagination from "../Pagination";
import { useAdvancedSearch } from "../../hooks/queries/useAdvancedSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectOptionLabel } from "../ui/select-option-label";
import { SEARCH_PAGE_SORT_OPTIONS } from "../../lib/select-option-maps";

interface SearchResultsListProps {
  hotelData?: HotelSearchResponse;
  isSearchLoading: boolean;
  searchContext: ReturnType<typeof useAdvancedSearch>["searchContext"];
  filters: ReturnType<typeof useAdvancedSearch>["filters"];
}

export const SearchResultsList = ({
  hotelData,
  isSearchLoading,
  searchContext,
  filters,
}: SearchResultsListProps) => {
  return (
    <div className="flex flex-col gap-5 order-1 lg:order-2">
      <div className="flex justify-between items-center">
        <span className="text-xl font-medium">
          {isSearchLoading
            ? "Searching…"
            : `${hotelData?.pagination.total ?? 0} Hotels found`}
          {searchContext.destination ? ` in ${searchContext.destination}` : ""}
        </span>
        <Select
          value={filters.sortOption || "default"}
          onValueChange={filters.handleSortChange}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_PAGE_SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <SelectOptionLabel icon={o.icon}>{o.label}</SelectOptionLabel>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isSearchLoading || hotelData === undefined ? (
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 rounded-xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
      ) : hotelData.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No hotels found
          </h3>
          <p className="text-gray-500 max-w-md">
            {searchContext.destination ? (
              <>
                We couldn't find any hotels in{" "}
                <span className="font-medium">{searchContext.destination}</span>
                {filters.selectedStars.length > 0 && (
                  <>
                    {" "}
                    with {filters.selectedStars.length === 1 ? "a" : ""}{" "}
                    {filters.selectedStars.join(", ")} star rating
                  </>
                )}
                {filters.selectedPrice && (
                  <> under ${filters.selectedPrice} per night</>
                )}
                .
              </>
            ) : (
              <>
                We couldn't find any hotels matching your criteria
                {filters.selectedStars.length > 0 && (
                  <>
                    {" "}
                    with {filters.selectedStars.length === 1 ? "a" : ""}{" "}
                    {filters.selectedStars.join(", ")} star rating
                  </>
                )}
                {filters.selectedPrice && (
                  <> under ${filters.selectedPrice} per night</>
                )}
                .
              </>
            )}
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-400">
            <p>
              Try adjusting your filters or search for a different destination.
            </p>
            {filters.selectedStars.length > 0 ||
            filters.selectedHotelTypes.length > 0 ||
            filters.selectedFacilities.length > 0 ||
            filters.selectedPrice ? (
              <button
                onClick={filters.clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {hotelData.data.map((hotel: any) => (
            <SearchResultsCard key={hotel._id} hotel={hotel} />
          ))}
          <div>
            <Pagination
              page={hotelData.pagination.page || 1}
              pages={hotelData.pagination.pages || 1}
              onPageChange={filters.setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};
