import { useState } from "react";
import {
  useAnalyticsDashboard,
  useAnalyticsForecast,
  useAnalyticsOps,
} from "../hooks/queries/useAnalyticsDashboard";
import {
  Loader2,
  RefreshCw,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { OverviewTab } from "../components/insights/OverviewTab";
import { ForecastTab } from "../components/insights/ForecastTab";
import { QualityTab } from "../components/insights/QualityTab";
import { SystemOpsTab } from "../components/insights/SystemOpsTab";
import { TabId } from "../types/analytics";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: analyticsData,
    isLoading,
    isFetching: dashboardFetching,
    error,
    refetch,
  } = useAnalyticsDashboard();

  const {
    data: forecastData,
    isLoading: forecastLoading,
    isFetching: forecastFetching,
    refetch: refetchForecast,
  } = useAnalyticsForecast();

  const {
    data: opsData,
    isLoading: opsLoading,
    isFetching: opsFetching,
    refetch: refetchOps,
  } = useAnalyticsOps();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchForecast(), refetchOps()]);
    setIsRefreshing(false);
  };

  const refreshing =
    isRefreshing || dashboardFetching || forecastFetching || opsFetching;

  const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "forecast", label: "Forecasting", icon: TrendingUp },
    { id: "quality", label: "Quality", icon: ShieldCheck },
    { id: "ops", label: "Ops status", icon: Activity },
  ];

  return (
    <div className="w-full min-h-0 space-y-6">
      {/* Page header — always visible (Vite shell) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-stretch gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-primary-100 px-3 text-primary-600">
            <BarChart3 className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-lg md:text-2xl font-medium text-gray-700 leading-tight">
              Business Insights Dashboard
            </h1>
            <p className="text-gray-600 text-sm font-normal ">
              Comprehensive insights into your hotel booking business
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {refreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-1 px-4 sm:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          data={analyticsData}
          isLoading={isLoading}
          isFetching={dashboardFetching}
          error={error}
          onRetry={() => void handleRefresh()}
          COLORS={COLORS}
        />
      )}

      {activeTab === "forecast" && (
        <ForecastTab
          data={forecastData}
          isLoading={forecastLoading}
          isFetching={forecastFetching}
        />
      )}

      {activeTab === "quality" && (
        <QualityTab
          data={analyticsData}
          isLoading={isLoading}
          isFetching={dashboardFetching}
          COLORS={COLORS}
        />
      )}

      {activeTab === "ops" && (
        <SystemOpsTab
          data={opsData}
          isLoading={opsLoading}
          isFetching={opsFetching}
        />
      )}

      <div className="text-center text-gray-500 text-sm">
        Last updated:{" "}
        {analyticsData?.lastUpdated
          ? new Date(analyticsData.lastUpdated).toLocaleString()
          : "N/A"}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
