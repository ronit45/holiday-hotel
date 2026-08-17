export interface AnalyticsData {
  overview: {
    totalHotels: number;
    totalUsers: number;
    totalBookings: number;
    recentBookings: number;
    totalRevenue: number;
    recentRevenue: number;
    revenueGrowth: number;
    cancelledBookings?: number;
    confirmedBookings?: number;
    pendingBookings?: number;
    refundedBookings?: number;
    totalRefundAmount?: number;
    cancellationRate?: number;
    totalReviews?: number;
    avgReviewRating?: number;
    avgLos?: number;
    adr?: number;
    avgPartySize?: number;
    verifiedReviewCount?: number;
  };
  popularDestinations: Array<{
    _id: string;
    count: number;
    avgPrice: number;
    totalRevenue?: number;
  }>;
  dailyBookings: Array<{
    date: string;
    bookings: number;
  }>;
  hotelPerformance: Array<{
    _id?: string;
    name: string;
    city: string;
    starRating: number;
    pricePerNight: number;
    bookingCount: number;
    totalRevenue: number;
  }>;
  bookingStatusBreakdown?: Array<{ status: string; count: number }>;
  paymentStatusBreakdown?: Array<{ status: string; count: number }>;
  guestMix?: { adults: number; children: number };
  reviewCategoryAverages?: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
  hotelsByStar?: Array<{ starRating: number; count: number }>;
  lastUpdated: string;
}

export interface ForecastData {
  historical: Array<{
    week: string;
    bookings: number;
    revenue: number;
  }>;
  forecasts: Array<{
    week: string;
    bookings: number;
    revenue: number;
    confidence: number;
  }>;
  seasonalGrowth: number;
  trends: {
    bookingTrend: string;
    revenueTrend: string;
  };
  lastUpdated: string;
}

export interface OpsStatusData {
  system?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
  database: {
    collections?: number;
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
  };
  application: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    uptime: string;
    todayBookings: number;
    thisWeekBookings: number;
  };
  lastUpdated: string;
}

export type TabId = "overview" | "forecast" | "ops" | "quality";
