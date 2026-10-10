import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { Plus, Edit, Eye, Building2, Users, TrendingUp, Power, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";

const MyHotels = () => {
  const { isLoggedIn, showToast } = useAppContext();
  const [data, setData] = useState(null);

  const fetchHotels = async () => { if (isLoggedIn) setData(await apiClient.fetchMyHotels().catch(() => [])); };
  useEffect(() => { fetchHotels(); }, [isLoggedIn]);

  const toggle = async (id, s) => {
    try { await apiClient.updateMyHotelActive(id, !s); showToast({ title: "Updated", type: "SUCCESS" }); fetchHotels(); }
    catch { showToast({ title: "Error", type: "ERROR" }); }
  };

  if (!isLoggedIn) return (
    <div className="flex justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white rounded border p-8 text-center space-y-4">
        <Building2 className="mx-auto w-12 h-12 text-blue-600" />
        <h2 className="text-2xl font-bold">Manage Your Hotels</h2>
        <p className="text-gray-600 text-sm">Sign in with test@user.com / 12345678 or your own account.</p>
        <Link to="/sign-in" className="block w-full bg-blue-600 text-white py-2 rounded">Sign In</Link>
      </div>
    </div>
  );

  if (!data) return <div className="animate-pulse flex flex-col gap-4 py-8"><div className="h-8 w-48 bg-gray-200 rounded" /><div className="h-40 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Hotels</h1>
        <Link to="/add-hotel" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 font-medium hover:bg-blue-700"><Plus className="w-4 h-4"/> Add Hotel</Link>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded border"><p className="text-gray-500 mb-4">No hotels added yet.</p><Link to="/add-hotel" className="text-blue-600 font-medium hover:underline">Add one now</Link></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[ {l: "Hotels", v: data.length, i: Building2}, {l: "Bookings", v: data.reduce((s,h) => s+(h.totalBookings||0),0), i: Users}, {l: "Revenue", v: `£${data.reduce((s,h) => s+(h.totalRevenue||0),0).toLocaleString()}`, i: TrendingUp} ].map(s => (
              <div key={s.l} className="bg-white p-4 rounded border flex justify-between items-center">
                <div><p className="text-sm text-gray-500">{s.l}</p><p className="text-xl font-bold">{s.v}</p></div>
                <div className="p-3 bg-blue-50 rounded text-blue-600"><s.i className="w-6 h-6"/></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map(h => (
              <div key={h._id} className="bg-white rounded border overflow-hidden flex flex-col hover:shadow-md transition">
                <div className="relative h-48 bg-gray-100">
                  <img src={h.imageUrls[0]} className="w-full h-full object-cover" alt={h.name} />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">£{h.pricePerNight}/night</span>
                    <span className={`text-xs px-2 py-1 rounded text-white font-medium ${h.isActive === false ? 'bg-gray-600' : 'bg-green-600'}`}>{h.isActive === false ? 'Inactive' : 'Active'}</span>
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold truncate hover:text-blue-600"><Link to={`/detail/${h._id}`}>{h.name}</Link></h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-2 font-medium"><MapPin className="w-4 h-4"/>{h.city}, {h.country}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic">"{h.description}"</p>
                  <div className="flex gap-4 mb-4 text-center text-sm border-t border-b py-2 mt-auto bg-gray-50/50">
                    <div className="flex-1"><p className="font-bold text-blue-700 text-lg">{h.upcomingBookings||0}</p><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Upcoming</p></div>
                    <div className="flex-1 border-l"><p className="font-bold text-green-700 text-lg">{h.completedBookings||0}</p><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Completed</p></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link to={`/edit-hotel/${h._id}`} className="flex-1 bg-blue-600 text-white py-2 rounded text-center text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700"><Edit className="w-4 h-4"/> Edit</Link>
                      <Link to={`/detail/${h._id}`} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-center text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200"><Eye className="w-4 h-4"/> View</Link>
                    </div>
                    <button onClick={() => toggle(h._id, h.isActive !== false)} className="w-full border border-gray-300 text-gray-700 py-2 rounded text-sm font-bold flex justify-center items-center gap-2 hover:bg-gray-50"><Power className="w-4 h-4"/> {h.isActive === false ? "Activate Listing" : "Deactivate Listing"}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default MyHotels;
