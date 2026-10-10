import { useState } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { useAppContext } from "../contexts/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, User, CreditCard } from "lucide-react";

const GuestInfoForm = ({ hotelId, pricePerNight }) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkIn, setCheckIn] = useState(search.checkIn ? search.checkIn.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(search.checkOut ? search.checkOut.toISOString().split("T")[0] : new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [adultCount, setAdultCount] = useState(search.adultCount || 1);
  const [childCount, setChildCount] = useState(search.childCount || 0);

  const numberOfNights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const totalPrice = pricePerNight * numberOfNights;

  const handleSubmit = (e) => {
    e.preventDefault();
    search.saveSearchValues("", new Date(checkIn), new Date(checkOut), adultCount, childCount);
    navigate(isLoggedIn ? `/hotel/${hotelId}/booking` : "/sign-in", { state: { from: location } });
  };

  return (
    <div className="w-full border rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between font-bold mb-4">
        <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-blue-600" /> Booking Summary</div>
        <span className="text-gray-900">£{pricePerNight}/night</span>
      </div>

      <div className="flex justify-between items-center py-4 border-y text-gray-700">
        <span>£{pricePerNight} × {numberOfNights} night{numberOfNights > 1 ? "s" : ""}</span>
        <div className="text-right">
          <div className="text-xl font-black text-gray-900">£{totalPrice}</div>
          <div className="text-xs text-gray-500">Total Price</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700"><Calendar className="h-4 w-4" /> Select Dates</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required min={new Date().toISOString().split("T")[0]} value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white" />
            <input type="date" required min={checkIn} value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700"><Users className="h-4 w-4" /> Guest Information</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs text-gray-600 flex items-center gap-2">
              Adults <input type="number" min={1} max={20} required value={adultCount} onChange={e => setAdultCount(parseInt(e.target.value))} className="w-full text-center border rounded-md p-2" />
            </label>
            <label className="text-xs text-gray-600 flex items-center gap-2">
              Children <input type="number" min={0} max={20} required value={childCount} onChange={e => setChildCount(parseInt(e.target.value))} className="w-full text-center border rounded-md p-2" />
            </label>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition flex items-center justify-center gap-2">
          {isLoggedIn ? <><CreditCard className="h-4 w-4" /> Book Now</> : <><User className="h-4 w-4" /> Sign in to Book</>}
        </button>
      </form>
      <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">Free cancellation • No booking fees • Instant confirmation</div>
    </div>
  );
};
export default GuestInfoForm;
