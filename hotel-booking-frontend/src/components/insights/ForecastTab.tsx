import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import { TrendingUp, DollarSign, Activity, Sparkles, LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard, toneFromNumber, toneFromTrend } from "./MetricStatCard";
import { ForecastData } from "../../types/analytics";

interface ForecastTabProps {
  data?: ForecastData;
  isLoading: boolean;
  isFetching: boolean;
}

export const ForecastTab = ({ data, isLoading, isFetching }: ForecastTabProps) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const forecastTableRows = data
    ? [
        ...data.historical.map((h) => ({
          week: h.week,
          bookings: h.bookings,
          revenue: h.revenue,
          kind: "Historical" as const,
          confidence: null as number | null,
        })),
        ...data.forecasts.map((f) => ({
          week: f.week,
          bookings: f.bookings,
          revenue: f.revenue,
          kind: "Forecast" as const,
          confidence: f.confidence,
        })),
      ]
    : [];

  const avgConf = data
    ? data.forecasts.reduce((sum, f) => sum + f.confidence, 0) /
      data.forecasts.length
    : 0;

  return (
    <>
      {isLoading && !data && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {data && (
        <div
          className={`w-full space-y-8 ${isFetching ? "opacity-90" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={TrendingUp}
              title="Booking Trend"
              subtitle="Predicted direction"
              value={
                <span className="capitalize">
                  {data.trends.bookingTrend}
                </span>
              }
              tone={toneFromTrend(data.trends.bookingTrend)}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={DollarSign}
              title="Revenue Trend"
              subtitle="Predicted direction"
              value={
                <span className="capitalize">
                  {data.trends.revenueTrend}
                </span>
              }
              tone={toneFromTrend(data.trends.revenueTrend)}
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Activity}
              title="Seasonal Growth"
              subtitle="Modelled seasonality"
              value={`${data.seasonalGrowth.toFixed(1)}%`}
              tone={toneFromNumber(data.seasonalGrowth)}
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="AI Confidence"
              subtitle="Avg forecast confidence"
              value={`${(avgConf * 100).toFixed(0)}%`}
              tone={
                avgConf >= 0.6
                  ? "positive"
                  : avgConf >= 0.4
                    ? "warning"
                    : "negative"
              }
              iconClassName="bg-violet-100 text-violet-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={LineChartIcon}
                title="Booking Forecast"
                subtitle="Historical + projected weekly bookings"
                iconClassName="bg-blue-100 text-blue-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[...data.historical, ...data.forecasts]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Bookings"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  >
                    <LabelList
                      dataKey="bookings"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={DollarSign}
                title="Revenue Forecast"
                subtitle="Historical + projected weekly revenue"
                iconClassName="bg-emerald-100 text-emerald-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[...data.historical, ...data.forecasts]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [
                      formatCurrency(value as number),
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      className="text-xs fill-gray-700"
                      formatter={(v) =>
                        typeof v === "number" ? `$${Math.round(v)}` : v
                      }
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border p-6 w-full">
            <InsightsCardHeader
              icon={BarChart3}
              title="Historical vs Forecast"
              subtitle="Weekly bookings, revenue, and confidence"
              iconClassName="bg-indigo-100 text-indigo-600"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Week", "Kind", "Bookings", "Revenue", "Confidence"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastTableRows.map((row) => (
                    <tr
                      key={`${row.kind}-${row.week}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(row.week).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.kind}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          row.bookings > 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {row.bookings}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          row.revenue > 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.confidence != null
                          ? `${Math.round(row.confidence * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
