const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components', 'insights');
const dashFile = path.join(srcDir, 'pages', 'AnalyticsDashboard.tsx');

let content = fs.readFileSync(dashFile, 'utf-8');

// The file has tabs rendered like this:
// {activeTab === "overview" && ( ... )} or similar
// Instead of complex AST, I will manually create the sub-components and we will replace the whole return block in AnalyticsDashboard.
// Wait, to make it completely bulletproof, I will extract everything between `{activeTab === "overview" && ` and `{activeTab === "forecast" && `.

const overviewStart = content.indexOf('{error && activeTab === "overview" && !analyticsData && (');
const forecastStart = content.indexOf('{activeTab === "forecast" && (');
const qualityStart = content.indexOf('{activeTab === "quality" && (');
const opsStart = content.indexOf('{activeTab === "ops" && (');
const tabsEnd = content.indexOf('</div>\n    </div>\n  );\n};');

if (overviewStart === -1 || forecastStart === -1 || qualityStart === -1 || opsStart === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const overviewContent = content.substring(overviewStart, forecastStart);
const forecastContent = content.substring(forecastStart, qualityStart);
const qualityContent = content.substring(qualityStart, opsStart);
const opsContent = content.substring(opsStart, tabsEnd);

// I will output the extracted content into temporary files to check them.
fs.writeFileSync(path.join(__dirname, 'overview_raw.tsx'), overviewContent);
fs.writeFileSync(path.join(__dirname, 'forecast_raw.tsx'), forecastContent);
fs.writeFileSync(path.join(__dirname, 'quality_raw.tsx'), qualityContent);
fs.writeFileSync(path.join(__dirname, 'ops_raw.tsx'), opsContent);

console.log("Raw files written.");
