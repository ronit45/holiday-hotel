import {
  ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList
} from "recharts";
import { Star, Sparkles, BadgeCheck, Ban, BarChart3, Hotel, Users } from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard, toneFromNumber } from "./MetricStatCard";
import { AnalyticsData } from "../../types/analytics";

interface QualityTabProps {
  data?: AnalyticsData;
  isLoading: boolean;
  isFetching: boolean;
  COLORS: string[];
}

export const QualityTab = ({ data, isLoading, isFetching }: QualityTabProps) => {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const ov = data?.overview;
  
  const cancelRate = ov && ov.totalBookings > 0
    ? ((ov.cancelledBookings || 0) / ov.totalBookings * 100).toFixed(1)
    : 0;

  const statusChartData = data?.bookingStatusBreakdown
    ? data.bookingStatusBreakdown.map((item) => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        count: item.count,
      }))
    : [];

  const categoryRows = data?.reviewCategoryAverages
    ? Object.entries(data.reviewCategoryAverages)
        .map(([category, score]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          score: Number(score.toFixed(1)),
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  const topCategory = categoryRows.length > 0 ? categoryRows[0] : null;

  return (
    <>
      {isLoading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {data && ov && (
        <div className={`w-full space-y-8 ${isFetching ? "opacity-90" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricStatCard
              icon={Star}
              title="Total Reviews"
              subtitle="Guest feedback volume"
              value={formatNumber(ov.totalReviews ?? 0)}
              tone={toneFromNumber(ov.totalReviews ?? 0)}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="Avg Rating"
              subtitle="Across all reviews"
              value={`${ov.avgReviewRating ?? 0} ★`}
              tone={
                (ov.avgReviewRating ?? 0) >= 4
                  ? "positive"
                  : (ov.avgReviewRating ?? 0) >= 3
                    ? "warning"
                    : (ov.avgReviewRating ?? 0) > 0
                      ? "negative"
                      : "neutral"
              }
              iconClassName="bg-yellow-100 text-yellow-600"
            />
            <MetricStatCard
              icon={BadgeCheck}
              title="Verified Reviews"
              subtitle={
                topCategory
                  ? `Top category: ${topCategory.category}`
                  : "Verified guest stays"
              }
              value={formatNumber(ov.verifiedReviewCount ?? 0)}
              tone={toneFromNumber(ov.verifiedReviewCount ?? 0)}
              iconClassName="bg-teal-100 text-teal-600"
            />
            <MetricStatCard
              icon={Ban}
              title="Cancel Rate"
              subtitle={`${formatNumber(ov.cancelledBookings ?? 0)} cancelled`}
              value={`${cancelRate}%`}
              tone={
                Number(cancelRate) > 15
                  ? "negative"
                  : Number(cancelRate) > 5
                    ? "warning"
                    : "positive"
              }
              iconClassName="bg-red-100 text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={BarChart3}
                title="Booking Status Mix"
                subtitle="Server-side status breakdown"
                iconClassName="bg-indigo-100 text-indigo-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, "Bookings"]} />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Star}
                title="Review Categories"
                subtitle="Average scores by category"
                iconClassName="bg-amber-100 text-amber-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryRows} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="category" width={90} />
                  <Tooltip formatter={(value) => [value, "Avg score"]} />
                  <Bar dataKey="score" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="score"
                      position="right"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(data.hotelsByStar?.length || data.guestMix) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {data.hotelsByStar &&
                data.hotelsByStar.length > 0 && (
                  <div className="bg-white rounded-xl shadow-xl border p-6">
                    <InsightsCardHeader
                      icon={Hotel}
                      title="Hotels by Star Rating"
                      subtitle="Inventory mix"
                      iconClassName="bg-sky-100 text-sky-600"
                    />
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={data.hotelsByStar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="starRating" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, "Hotels"]} />
                        <Bar
                          dataKey="count"
                          fill="#0EA5E9"
                          radius={[4, 4, 0, 0]}
                        >
                          <LabelList
                            dataKey="count"
                            position="top"
                            className="text-xs fill-gray-700"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              {data.guestMix && (
                <div className="bg-white rounded-xl shadow-xl border p-6">
                  <InsightsCardHeader
                    icon={Users}
                    title="Guest Demographics"
                    subtitle="Party composition"
                    iconClassName="bg-rose-100 text-rose-600"
                  />
                  <div className="flex flex-col justify-center space-y-6 h-[240px]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Adults</span>
                        <span className="font-bold text-gray-800">
                          {((data.guestMix.adults / (data.guestMix.adults + data.guestMix.children)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-rose-500 h-2.5 rounded-full"
                          style={{
                            width: `${(data.guestMix.adults / (data.guestMix.adults + data.guestMix.children)) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {data.guestMix.adults.toLocaleString()} total
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          Children
                        </span>
                        <span className="font-bold text-gray-800">
                          {((data.guestMix.children / (data.guestMix.adults + data.guestMix.children)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-500 h-2.5 rounded-full"
                          style={{
                            width: `${(data.guestMix.children / (data.guestMix.adults + data.guestMix.children)) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {data.guestMix.children.toLocaleString()} total
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
