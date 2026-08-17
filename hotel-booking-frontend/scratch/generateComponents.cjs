const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components', 'insights');

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Helper to remove `activeTab === "X" && ` prefix from the top level
const stripPrefix = (jsx, tab) => {
  return jsx.replace(new RegExp(`\\{error && activeTab === "${tab}" && \\!analyticsData && \\(`), '{error && !data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && isLoading && \\!analyticsData && \\(`), '{isLoading && !data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && forecastLoading && \\!forecastData && \\(`), '{isLoading && !data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && opsLoading && \\!opsData && \\(`), '{isLoading && !data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && analyticsData && ov && \\(`), '{data && ov && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && analyticsData && \\(`), '{data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && forecastData && \\(`), '{data && (')
            .replace(new RegExp(`\\{activeTab === "${tab}" && opsData && \\(`), '{data && (');
};

const overviewRaw = fs.readFileSync(path.join(__dirname, 'overview_raw.tsx'), 'utf-8');
const overviewJSX = stripPrefix(overviewRaw, 'overview');

const overviewComponent = `import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from "recharts";
import {
  Building, Users, Calendar, DollarSign, BedDouble, CreditCard, UserRound, Ban, Receipt, Star, Sparkles, MapPin, Hotel, TrendingUp, TrendingDown
} from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard, toneFromNumber, toneFromTrend } from "./MetricStatCard";
import { AnalyticsData } from "../../types/analytics";

interface OverviewTabProps {
  data?: AnalyticsData;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  COLORS: string[];
}

export const OverviewTab = ({ data, isLoading, isFetching, error, onRetry, COLORS }: OverviewTabProps) => {
  const ov = data?.overview;
  const cancelRate = ov && ov.totalBookings > 0
    ? ((ov.cancelledBookings || 0) / ov.totalBookings * 100).toFixed(1)
    : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <>
      ${overviewJSX.split('\\n').join('\\n      ')}
    </>
  );
};
`;

fs.writeFileSync(path.join(componentsDir, 'OverviewTab.tsx'), overviewComponent);

const forecastRaw = fs.readFileSync(path.join(__dirname, 'forecast_raw.tsx'), 'utf-8');
const forecastJSX = stripPrefix(forecastRaw, 'forecast');

const forecastComponent = `import {
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
      ${forecastJSX.split('\\n').join('\\n      ')}
    </>
  );
};
`;

fs.writeFileSync(path.join(componentsDir, 'ForecastTab.tsx'), forecastComponent);

console.log("Components written successfully.");
