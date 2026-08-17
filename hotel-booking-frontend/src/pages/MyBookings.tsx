import { Link } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  MapPin,
  Package,
  DollarSign,
  UserCircle,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useMyBookings } from "../hooks/queries/useMyBookings";
import { BookingGroup } from "../components/bookings/BookingGroup";

const MyBookings = () => {
  const { data: hotels, isLoading, isFetching, isLoggedIn, stats } = useMyBookings();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary-100">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-2xl font-medium text-gray-700">
                  My Bookings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your hotel reservations and booking details
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To view your bookings, please sign in with your test credentials
              or your personal account.
            </p>
            <div className="flex flex-col gap-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-normal text-gray-700">
                  Test credentials: test@user.com / 12345678
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-normal text-gray-700">
                  Or use your own registered account
                </span>
              </div>
            </div>
            <Link to="/sign-in">
              <Button className="w-full font-medium bg-primary-600 hover:bg-primary-700 mt-4">
                <Sparkles className="h-4 w-4 mr-2 text-white" />
                Sign In to View Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Skeleton while query settles
  if (isLoading || (isFetching && hotels === undefined)) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-56 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 rounded-2xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-2xl animate-pulse border border-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No Bookings Found
          </h3>
          <p className="text-gray-500">You haven't made any bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-lg md:text-2xl font-medium mb-2">
          My Bookings History
        </h1>
        <p className="text-blue-100 text-lg">
          Track all your hotel reservations and booking details
        </p>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-blue-100">
              {stats.totalBookings} Total Bookings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-blue-100">
              {stats.differentHotels} Different Hotels
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-blue-100">
              £{stats.totalSpent.toFixed(2)} Total Spent
            </span>
          </div>
        </div>
      </div>
      
      {/* Bookings Grid */}
      <div className="grid grid-cols-1 gap-8">
        {hotels.map((hotel: any) => (
          <BookingGroup key={hotel._id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
