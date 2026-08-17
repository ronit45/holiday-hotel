const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components', 'insights');

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

const qualityRaw = fs.readFileSync(path.join(__dirname, 'quality_raw.tsx'), 'utf-8');
const qualityJSX = stripPrefix(qualityRaw, 'quality');

const qualityComponent = `import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList
} from "recharts";
import { Star, MessageCircle, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard, toneFromNumber } from "./MetricStatCard";
import { AnalyticsData } from "../../types/analytics";

interface QualityTabProps {
  data?: AnalyticsData;
  isLoading: boolean;
  isFetching: boolean;
  COLORS: string[];
}

export const QualityTab = ({ data, isLoading, isFetching, COLORS }: QualityTabProps) => {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const reviewCategories = data?.reviewCategoryAverages
    ? Object.entries(data.reviewCategoryAverages).map(([category, rating]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        rating: rating,
      }))
    : [];

  return (
    <>
      ${qualityJSX.split('\\n').join('\\n      ')}
    </>
  );
};
`;

fs.writeFileSync(path.join(componentsDir, 'QualityTab.tsx'), qualityComponent);

const opsRaw = fs.readFileSync(path.join(__dirname, 'ops_raw.tsx'), 'utf-8');
const opsJSX = stripPrefix(opsRaw, 'ops');

const opsComponent = `import { Server, Clock, RefreshCw, Activity, CheckCircle2, Database, AlertCircle } from "lucide-react";
import { InsightsCardHeader } from "./InsightsCardHeader";
import { MetricStatCard } from "./MetricStatCard";
import { OpsStatusData } from "../../types/analytics";

interface SystemOpsTabProps {
  data?: OpsStatusData;
  isLoading: boolean;
  isFetching: boolean;
}

export const SystemOpsTab = ({ data, isLoading, isFetching }: SystemOpsTabProps) => {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <>
      ${opsJSX.split('\\n').join('\\n      ')}
    </>
  );
};
`;

fs.writeFileSync(path.join(componentsDir, 'SystemOpsTab.tsx'), opsComponent);

console.log("Remaining components written successfully.");
