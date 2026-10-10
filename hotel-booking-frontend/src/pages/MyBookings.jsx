import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Building, Users, CreditCard, Phone, DollarSign, Package } from "lucide-react";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import CancelBookingButton from "../components/CancelBookingButton";
import { getStatusColor, getStatusIcon, getPaymentStatusColor } from "../utils/booking-utils";

const MyBookings = () => {
  const { isLoggedIn } = useAppContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isLoggedIn) apiClient.fetchMyBookings().then(setData).catch(() => setData([]));
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div className="flex justify-center py-12 px-4 text-center">
      <div className="max-w-lg w-full bg-white rounded border p-8 space-y-4">
        <Calendar className="mx-auto w-12 h-12 text-blue-600" />
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <p className="text-gray-600">Sign in to view your bookings.</p>
        <Link to="/sign-in" className="block bg-blue-600 text-white py-2 rounded">Sign In</Link>
      </div>
    </div>
  );

  if (!data) return <div className="animate-pulse space-y-4"><div className="h-10 w-48 bg-gray-200 rounded" /><div className="h-40 bg-gray-100 rounded" /></div>;

  if (data.length === 0) return <div className="text-center py-12 text-gray-500"><Package className="w-16 h-16 mx-auto mb-2 text-gray-400" /> No bookings found.</div>;

  let totBookings = 0, totSpent = 0;
  data.forEach(h => h.bookings.forEach(b => {
    totBookings++;
    totSpent += h.pricePerNight * Math.max(1, Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000));
  }));

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-lg p-6 text-white flex flex-col md:flex-row justify-between md:items-center">
        <div><h1 className="text-2xl font-bold">My Bookings History</h1><p className="text-blue-100">Track your hotel reservations</p></div>
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0 text-blue-100 font-medium">
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded"><Calendar className="w-4 h-4"/> {totBookings} Bookings</div>
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded"><MapPin className="w-4 h-4"/> {data.length} Hotels</div>
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded"><DollarSign className="w-4 h-4"/> £{totSpent.toFixed(2)} Spent</div>
        </div>
      </div>

      <div className="space-y-6">
        {data.map(hotel => (
          <div key={hotel._id} className="bg-white rounded-lg border overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex items-start gap-4">
              <img src={hotel.imageUrls[0]} className="w-20 h-20 rounded object-cover border" alt={hotel.name} />
              <div>
                <h2 className="text-xl font-bold">{hotel.name}</h2>
                <p className="text-gray-600 text-sm flex items-center gap-1 mt-1 font-medium"><MapPin className="w-4 h-4"/>{hotel.city}, {hotel.country} <Building className="w-4 h-4 ml-2"/>£{hotel.pricePerNight}/night</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {hotel.bookings.map(b => {
                const nights = Math.max(1, Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000));
                return (
                  <div key={b._id} className="bg-gray-50 rounded border p-4 hover:shadow-sm transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded ${getStatusColor(b.status || 'pending')}`}>{getStatusIcon(b.status || 'pending')}</span>
                        <div><h3 className="font-bold text-gray-800">Booking #{b._id.slice(-8).toUpperCase()}</h3><p className="text-xs text-gray-500 font-medium">Booked {new Date(b.createdAt || b.checkIn).toLocaleDateString()}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs border font-bold uppercase ${getStatusColor(b.status)}`}>{b.status}</span>
                        <span className={`px-2 py-1 rounded text-xs border font-bold uppercase ${getPaymentStatusColor(b.paymentStatus)}`}>{b.paymentStatus}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white border rounded p-3 text-sm"><div className="font-bold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-4 h-4"/> Dates</div>{new Date(b.checkIn).toDateString()} <br/> {new Date(b.checkOut).toDateString()}</div>
                      <div className="bg-white border rounded p-3 text-sm"><div className="font-bold text-gray-700 mb-1 flex items-center gap-1"><Users className="w-4 h-4"/> Guests</div>{b.adultCount} Adults <br/> {b.childCount} Children</div>
                      <div className="bg-white border rounded p-3 text-sm"><div className="font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone className="w-4 h-4"/> Contact</div><div className="truncate">{b.email}</div> {b.phone}</div>
                      <div className="bg-white border rounded p-3 text-sm"><div className="font-bold text-gray-700 mb-1 flex items-center gap-1"><CreditCard className="w-4 h-4"/> Total</div>{nights} Nights <br/> <span className="font-bold text-green-700 text-base">£{hotel.pricePerNight * nights}</span></div>
                    </div>
                    <CancelBookingButton booking={b} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MyBookings;
