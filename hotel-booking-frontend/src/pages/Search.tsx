import SearchBar from "../components/SearchBar";
import { useAdvancedSearch } from "../hooks/queries/useAdvancedSearch";
import { SearchFiltersSidebar } from "../components/search/SearchFiltersSidebar";
import { SearchResultsList } from "../components/search/SearchResultsList";

const Search = () => {
  const { hotelData, isSearchLoading, searchContext, filters } = useAdvancedSearch();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-xl border p-4">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Modify Your Search
        </h2>
        <SearchBar />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        <SearchFiltersSidebar {...filters} />
        
        <SearchResultsList 
          hotelData={hotelData}
          isSearchLoading={isSearchLoading}
          searchContext={searchContext}
          filters={filters}
        />
      </div>
    </div>
  );
};

export default Search;
