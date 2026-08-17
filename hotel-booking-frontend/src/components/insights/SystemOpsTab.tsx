import { Server, Clock, Activity, Database, AlertCircle } from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard } from "./MetricStatCard";
import { OpsStatusData } from "../../types/analytics";

interface SystemOpsTabProps {
  data?: OpsStatusData;
  isLoading: boolean;
  isFetching: boolean;
}

export const SystemOpsTab = ({ data, isLoading, isFetching }: SystemOpsTabProps) => {


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <>
      {isLoading && !data && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className={`w-full space-y-8 ${isFetching ? "opacity-90" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={Activity}
              title="Memory Usage"
              subtitle={
                data.system?.memory != null
                  ? `${data.system.memory.used}MB / ${data.system.memory.total}MB`
                  : "Sign in for process metrics"
              }
              value={
                data.system?.memory != null
                  ? `${data.system.memory.percentage}%`
                  : "—"
              }
              tone={
                data.system?.memory != null &&
                data.system.memory.percentage > 85
                  ? "warning"
                  : "neutral"
              }
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={Server}
              title="Uptime"
              subtitle={
                data.system?.uptime != null
                  ? `${Math.round(data.system.uptime / 3600)}h process`
                  : "Availability SLA"
              }
              value={data.application.uptime}
              tone="positive"
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Clock}
              title="Response Time"
              subtitle="Demo avg (not live APM)"
              value={`${data.application.avgResponseTime}ms`}
              tone={
                data.application.avgResponseTime > 200
                  ? "warning"
                  : "positive"
              }
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={AlertCircle}
              title="Error Rate"
              subtitle={`Demo RPM: ${data.application.requestsPerMinute}`}
              value={`${(data.application.errorRate * 100).toFixed(2)}%`}
              tone={
                data.application.errorRate > 0.05
                  ? "negative"
                  : data.application.errorRate > 0.01
                    ? "warning"
                    : "positive"
              }
              iconClassName="bg-yellow-100 text-yellow-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Database}
                title="Database Overview"
                subtitle="Collections and booking totals"
                iconClassName="bg-slate-100 text-slate-600"
              />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Collections</span>
                  <span className="font-medium text-gray-700">
                    {data.database.collections ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Hotels</span>
                  <span className="font-medium text-gray-700">
                    {data.database.totalHotels}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Bookings</span>
                  <span
                    className={`font-medium ${
                      data.database.totalBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {data.database.totalBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                  <span
                    className={`font-medium ${
                      data.database.totalRevenue > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {formatCurrency(data.database.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Activity}
                title="Recent Activity"
                subtitle="Booking velocity"
                iconClassName="bg-cyan-100 text-cyan-600"
              />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">
                    Today&apos;s Bookings
                  </span>
                  <span
                    className={`font-medium ${
                      data.application.todayBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {data.application.todayBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">
                    This Week&apos;s Bookings
                  </span>
                  <span
                    className={`font-medium ${
                      data.application.thisWeekBookings > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {data.application.thisWeekBookings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
