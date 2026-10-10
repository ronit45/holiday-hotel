import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import AuthLayout from "./layouts/AuthLayout";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";
import React, { Suspense, lazy } from "react";
import { useAppContext } from "./contexts/AppContext";

const Auth = lazy(() => import("./pages/Auth"));
const ManageHotel = lazy(() => import("./pages/ManageHotel"));
const MyHotels = lazy(() => import("./pages/MyHotels"));
const Search = lazy(() => import("./pages/Search"));
const Detail = lazy(() => import("./pages/Detail"));
const Booking = lazy(() => import("./pages/Booking"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Home = lazy(() => import("./pages/Home"));


const App = () => {
  const { isLoggedIn, currentUser } = useAppContext();
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />

        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />


        <Route path="/register" element={<AuthLayout><Auth /></AuthLayout>} />

        <Route path="/sign-in" element={<AuthLayout><Auth /></AuthLayout>} />




        <Route
          path="/my-bookings"
          element={
            <Layout>
              <MyBookings />
            </Layout>
          }
        />



        {isLoggedIn && (
          <>
            <Route
              path="/hotel/:hotelId/booking"
              element={
                <Layout>
                  <Booking />
                </Layout>
              }
            />
          </>
        )}

        {currentUser?.role === "admin" && (
          <>
            <Route
              path="/my-hotels"
              element={
                <Layout>
                  <MyHotels />
                </Layout>
              }
            />
            <Route path="/add-hotel" element={<Layout><ManageHotel /></Layout>} />
            <Route path="/edit-hotel/:hotelId" element={<Layout><ManageHotel /></Layout>} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
};

export default App;

