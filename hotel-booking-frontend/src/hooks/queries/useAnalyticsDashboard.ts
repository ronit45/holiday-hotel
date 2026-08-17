import { useQueryWithLoading } from "../useLoadingHooks";
import {
  fetchAdminBusinessInsightsDashboard,
  fetchBusinessInsightsForecast,
  fetchBusinessInsightsSystemStats,
} from "../../api-client";
import { AnalyticsData, ForecastData, OpsStatusData } from "../../types/analytics";

const QUERY_OPTS = {
  refetchInterval: false as const,
  retry: 3,
  retryDelay: 1000,
  keepPreviousData: true,
};

export const useAnalyticsDashboard = () => {
  return useQueryWithLoading<AnalyticsData>(
    "admin-business-insights-dashboard",
    fetchAdminBusinessInsightsDashboard,
    QUERY_OPTS
  );
};

export const useAnalyticsForecast = () => {
  return useQueryWithLoading<ForecastData>(
    "business-insights-forecast",
    fetchBusinessInsightsForecast,
    QUERY_OPTS
  );
};

export const useAnalyticsOps = () => {
  return useQueryWithLoading<OpsStatusData>(
    "business-insights-ops",
    fetchBusinessInsightsSystemStats,
    QUERY_OPTS
  );
};
