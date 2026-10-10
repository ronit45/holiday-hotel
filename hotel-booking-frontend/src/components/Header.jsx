import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";
import { useSearchContext } from "../contexts/SearchContext";
import PageContainer from "./PageContainer";

const getSearchUrl = () => {
  const c = new Date(); const o = new Date(); o.setDate(c.getDate() + 1);
  return `/search?${new URLSearchParams({ destination: "", checkIn: c.toISOString(), checkOut: o.toISOString(), adultCount: "1", childCount: "1", sortOption: "", page: "1" })}`;
};

const Header = () => {
  const { isLoggedIn, currentUser, showToast } = useAppContext();
  const search = useSearchContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const handleLogout = async () => {
    try { await apiClient.signOut(); showToast({ title: "Logged out", type: "SUCCESS" }); window.location.href = "/"; }
    catch { showToast({ title: "Error", type: "ERROR" }); }
  };

  const navLinks = [
    { to: getSearchUrl(), label: "Hotels" },
    ...(isLoggedIn ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
    ...(isLoggedIn && currentUser?.role === "admin" ? [{ to: "/my-hotels", label: "Manage Hotels" }] : [])
  ];

  const Links = ({ mobile }) => (
    <>
      {navLinks.map(l => <Link key={l.to} to={l.to} className={`text-gray-700 hover:text-blue-600 ${mobile ? 'py-3' : 'px-4 py-2 rounded-lg hover:bg-gray-100'}`} onClick={() => setMenuOpen(false)}>{l.label}</Link>)}
      {!isLoggedIn ? (
        <Link to="/sign-in" onClick={() => setMenuOpen(false)} className={`font-medium ${mobile ? 'w-full bg-blue-600 text-white py-2 text-center rounded mt-2' : 'px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white'}`}>Log In</Link>
      ) : (
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 border-2 border-teal-400">
            {(localStorage.getItem("user_name") || localStorage.getItem("user_email") || "U")[0].toUpperCase()}
          </button>
          {profileOpen && (
            <div className={`absolute ${mobile ? 'left-0' : 'right-0'} mt-2 w-48 bg-white border rounded shadow p-2 z-50`}>
              <p className="text-sm font-medium">{localStorage.getItem("user_name") || "User"}</p>
              <p className="text-xs text-gray-500 mb-2 truncate">{localStorage.getItem("user_email")}</p>
              {currentUser?.role === "admin" && <Link to="/add-hotel" className="block text-sm py-1 hover:text-blue-600" onClick={() => setProfileOpen(false)}>Add Hotel</Link>}
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 py-1 w-full text-left">Logout</button>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <header className="bg-white border-b sticky top-0 z-50 h-16 flex items-center">
      <PageContainer>
        <div className="flex justify-between items-center h-full">
          <button onClick={() => { search.clearSearchValues(); navigate("/"); }} className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /><span className="text-xl font-medium">HolidayHotel</span>
          </button>
          
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(true)}><Menu className="w-6 h-6"/></button>
            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
                <div className="w-64 bg-white h-full p-4 flex flex-col gap-2">
                  <div className="flex justify-end mb-4"><button onClick={() => setMenuOpen(false)}><X className="w-6 h-6"/></button></div>
                  <Links mobile />
                </div>
              </div>
            )}
          </div>
          
          <nav className="hidden md:flex items-center gap-2"><Links /></nav>
        </div>
      </PageContainer>
    </header>
  );
};
export default Header;
