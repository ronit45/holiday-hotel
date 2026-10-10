import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import { useSearchContext } from "../contexts/SearchContext";
import { useAppContext } from "../contexts/AppContext";
import { CreditCard, Calendar, Users, Loader2, MapPin } from "lucide-react";

const Booking = () => {
  const search = useSearchContext();
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const [hotel, setHotel] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const nights = (search.checkIn && search.checkOut) ? Math.max(1, Math.ceil(Math.abs(search.checkOut - search.checkIn) / 86400000)) : 0;

  useEffect(() => {
    Promise.all([apiClient.fetchHotelById(hotelId), apiClient.fetchCurrentUser()]).then(([h, u]) => {
      setHotel(h); setUser(u);
    }).finally(() => setLoading(false));
  }, [hotelId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await apiClient.createRoomBooking({
        firstName: user.firstName, lastName: user.lastName, email: user.email,
        adultCount: search.adultCount, childCount: search.childCount,
        checkIn: search.checkIn.toISOString(), checkOut: search.checkOut.toISOString(),
        hotelId, totalCost: hotel.pricePerNight * nights, phone, specialRequests
      });
      showToast({ title: "Booking Confirmed", type: "SUCCESS" });
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch {
      showToast({ title: "Booking Failed", type: "ERROR" });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  if (!hotel || !user) return <div className="text-center py-20 text-gray-500">Not Found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-800"><CreditCard className="w-6 h-6 text-blue-600"/> Complete Your Booking</div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-6">
          <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <h3 className="bg-gray-50 p-4 border-b font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600"/> Booking Summary</h3>
            <div className="p-5 space-y-4">
              <div className="font-bold text-lg text-gray-800">{hotel.name} <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1"><MapPin className="w-4 h-4"/>{hotel.city}, {hotel.country}</p></div>
              <div className="flex justify-between border-y py-3 text-sm"><div className="font-bold text-gray-700">Check-in<br/><span className="font-medium text-gray-600">{search.checkIn?.toDateString()}</span></div><div className="font-bold text-gray-700 text-right">Check-out<br/><span className="font-medium text-gray-600">{search.checkOut?.toDateString()}</span></div></div>
              <div className="text-sm"><span className="font-bold text-gray-700">Stay Length:</span> <span className="font-medium">{nights} night{nights !== 1 && 's'}</span></div>
              <div className="text-sm"><span className="font-bold text-gray-700">Guests:</span> <span className="font-medium">{search.adultCount} Adults, {search.childCount} Children</span></div>
            </div>
          </div>
        </div>

        {nights === 0 ? (
          <div className="border rounded-lg bg-white p-12 text-center shadow-sm text-gray-500"><Calendar className="mx-auto w-12 h-12 mb-3 opacity-30 text-blue-600"/> <p className="font-medium text-gray-600">Please select check-in and check-out dates.</p></div>
        ) : (
          <form onSubmit={onSubmit} className="border rounded-lg bg-white p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2 border-b pb-3 text-gray-800"><Users className="w-5 h-5 text-blue-600"/> Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="text-sm font-bold text-gray-700">First Name <input readOnly disabled value={user.firstName} className="w-full bg-gray-50 border p-2.5 rounded-md mt-1.5 font-medium text-gray-600" /></label>
              <label className="text-sm font-bold text-gray-700">Last Name <input readOnly disabled value={user.lastName} className="w-full bg-gray-50 border p-2.5 rounded-md mt-1.5 font-medium text-gray-600" /></label>
              <label className="text-sm font-bold text-gray-700">Email <input readOnly disabled value={user.email} className="w-full bg-gray-50 border p-2.5 rounded-md mt-1.5 font-medium text-gray-600" /></label>
              <label className="text-sm font-bold text-gray-700">Phone (Optional) <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-2.5 rounded-md mt-1.5 font-medium" placeholder="Enter phone number" /></label>
            </div>
            
            <label className="block text-sm font-bold text-gray-700">Special Requests <textarea rows={3} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="w-full border p-3 rounded-md mt-1.5 font-medium" placeholder="Any special requests..." /></label>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg flex justify-between items-center">
              <span className="font-bold text-blue-900 text-lg">Total Cost</span>
              <span className="text-3xl font-black text-blue-700">£{(hotel.pricePerNight * nights).toFixed(2)}</span>
            </div>

            <button disabled={bookingLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3.5 rounded-lg disabled:opacity-50 transition shadow-sm">
              {bookingLoading ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default Booking;
