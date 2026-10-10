import { useState } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { MdTravelExplore } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();

  const [destination, setDestination] = useState(search.destination || "");
  const [checkIn, setCheckIn] = useState(search.checkIn ? search.checkIn.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(search.checkOut ? search.checkOut.toISOString().split("T")[0] : new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [adultCount, setAdultCount] = useState(search.adultCount || 1);
  const [childCount, setChildCount] = useState(search.childCount || 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    search.saveSearchValues(destination.trim(), new Date(checkIn), new Date(checkOut), adultCount, childCount);
    navigate("/search");
  };

  const handleClear = () => {
    setDestination(""); setCheckIn(new Date().toISOString().split("T")[0]); setCheckOut(new Date(Date.now() + 86400000).toISOString().split("T")[0]); setAdultCount(1); setChildCount(0);
    search.clearSearchValues();
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4">
        
        <div className="flex flex-row items-center flex-1 relative sm:col-span-2 lg:col-span-1">
          <MdTravelExplore size={20} className="text-gray-500 absolute left-3 z-10" />
          <input placeholder="Where are you going?" className="pl-10 w-full border rounded-md h-10 px-3 py-2 text-sm" value={destination} onChange={e => setDestination(e.target.value)} />
        </div>

        <input type="date" required min={new Date().toISOString().split("T")[0]} value={checkIn} onChange={e => setCheckIn(e.target.value)} className="h-10 w-full rounded-md border px-3 py-2 text-sm" />
        <input type="date" required min={checkIn} value={checkOut} onChange={e => setCheckOut(e.target.value)} className="h-10 w-full rounded-md border px-3 py-2 text-sm" />

        <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2 lg:col-span-1">
          <label className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">Adults:
            <input type="number" min={1} max={20} required value={adultCount} onChange={e => setAdultCount(parseInt(e.target.value))} className="w-16 border rounded-md h-10 px-2" />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">Children:
            <input type="number" min={0} max={20} required value={childCount} onChange={e => setChildCount(parseInt(e.target.value))} className="w-16 border rounded-md h-10 px-2" />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className="flex-1 text-white bg-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-700">Search</button>
          <button type="button" onClick={handleClear} className="flex-1 text-white bg-gray-500 px-6 py-2 rounded-md font-medium hover:bg-gray-600">Clear</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
