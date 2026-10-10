import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { AiFillStar } from "react-icons/ai";
import { Star, Sparkles, DollarSign, MapPin, Check } from "lucide-react";
import { useSearchContext } from "../contexts/SearchContext";
import { hotelFacilities } from "../utils/hotel-options-config";
import SearchBar from "../components/SearchBar";

const Search = () => {
  const search = useSearchContext();
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({ page: 1, stars: [], facilities: [], maxPrice: "", sortOption: "" });

  useEffect(() => {
    if (params.get("checkIn") && params.get("checkOut")) {
      search.saveSearchValues(params.get("destination") || "", new Date(params.get("checkIn")), new Date(params.get("checkOut")), parseInt(params.get("adultCount") || "1"), parseInt(params.get("childCount") || "1"));
    }
  }, [params]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      apiClient.searchHotels({
        destination: search.destination || "", checkIn: search.checkIn.toISOString(), checkOut: search.checkOut.toISOString(),
        adultCount: search.adultCount.toString(), childCount: search.childCount.toString(),
        page: filters.page.toString(), stars: filters.stars, facilities: filters.facilities, maxPrice: filters.maxPrice, sortOption: filters.sortOption
      }).then(setData).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, filters]);

  const updateFilter = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }));
  const toggleArr = (k, v, c) => updateFilter(k, c ? [...filters[k], v] : filters[k].filter(x => x !== v));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border p-4"><SearchBar /></div>
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        
        {/* Filters Sidebar */}
        <div className="rounded border p-5 space-y-4 h-fit lg:sticky lg:top-20 bg-white">
          <h3 className="font-medium border-b pb-2">Filters</h3>
          <div>
            <div className="flex items-center gap-2 mb-2 font-medium text-sm"><Star className="w-4 h-4" /> Rating</div>
            {["5","4","3","2","1"].map(s => <label key={s} className="flex gap-2 text-sm items-center"><input type="checkbox" checked={filters.stars.includes(s)} onChange={e => toggleArr("stars", s, e.target.checked)} className="w-4 h-4"/> {s} Stars</label>)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 font-medium text-sm"><Sparkles className="w-4 h-4" /> Facilities</div>
            {hotelFacilities.map(f => <label key={f} className="flex gap-2 text-sm items-center"><input type="checkbox" checked={filters.facilities.includes(f)} onChange={e => toggleArr("facilities", f, e.target.checked)} className="w-4 h-4"/> {f}</label>)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 font-medium text-sm"><DollarSign className="w-4 h-4" /> Max Price</div>
            <select className="w-full border p-1 text-sm rounded bg-white" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)}>
              <option value="">Any</option>
              {[50,100,200,300,500].map(p => <option key={p} value={p}>£{p}</option>)}
            </select>
          </div>
          <button onClick={() => setFilters({ page: 1, stars: [], facilities: [], maxPrice: "", sortOption: "" })} className="text-blue-600 text-sm mt-2 font-medium hover:underline">Clear Filters</button>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-lg">{loading ? "Searching..." : `${data?.pagination.total || 0} Hotels found`}</span>
            <select className="border p-2 text-sm rounded bg-white w-48" value={filters.sortOption} onChange={e => updateFilter("sortOption", e.target.value)}>
              <option value="">Sort By...</option>
              <option value="starRating">Star Rating</option>
              <option value="pricePerNightAsc">Price (Low-High)</option>
              <option value="pricePerNightDesc">Price (High-Low)</option>
            </select>
          </div>

          {loading || !data ? [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded border" />) :
           data.data.length === 0 ? <div className="text-center py-12 bg-white rounded border text-gray-500">No hotels found matching criteria.</div> :
           data.data.map(h => (
             <div key={h._id} className="grid grid-cols-1 md:grid-cols-[250px_1fr_200px] gap-4 border rounded bg-white p-4 hover:shadow-md transition">
               <img src={h.imageUrls[0]} className="w-full h-48 md:h-full object-cover rounded bg-gray-100" alt={h.name} />
               <div className="flex flex-col justify-between py-1">
                 <div>
                   <Link to={`/detail/${h._id}`} className="text-xl font-bold hover:text-blue-600">{h.name}</Link>
                   <div className="flex text-yellow-400 my-1.5">{Array(h.starRating).fill().map((_,i) => <AiFillStar key={i} />)}</div>
                   <div className="text-sm font-bold text-blue-600 flex items-center gap-1 mb-2"><MapPin className="w-4 h-4"/> {h.city}, {h.country}</div>
                   <p className="text-sm text-gray-600 line-clamp-2 italic bg-blue-50/50 p-2 rounded">"{h.description}"</p>
                 </div>
                 <div className="flex flex-wrap gap-2 mt-3">
                   {h.facilities.slice(0, 3).map(f => <span key={f} className="text-xs text-emerald-600 flex items-center font-medium"><Check className="w-3 h-3 mr-1"/>{f}</span>)}
                 </div>
               </div>
               <div className="flex flex-col justify-end text-right md:border-l md:pl-4">
                 <div className="text-2xl font-black">£{h.pricePerNight}</div>
                 <div className="text-xs text-gray-500 mb-4">Per Night</div>
                 <Link to={`/detail/${h._id}`} className="bg-blue-600 text-white text-center py-2 px-4 rounded-full font-bold hover:bg-blue-700 text-sm">View Details</Link>
               </div>
             </div>
           ))}
           
           {data?.pagination.pages > 1 && (
             <div className="flex justify-center gap-2 mt-4">
               {Array.from({length: data.pagination.pages}).map((_, i) => (
                 <button key={i} onClick={() => setFilters(p => ({...p, page: i+1}))} className={`px-4 py-2 border rounded font-medium ${filters.page === i+1 ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}>{i+1}</button>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default Search;
