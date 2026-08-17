const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const dashFile = path.join(srcDir, 'pages', 'AnalyticsDashboard.tsx');
let lines = fs.readFileSync(dashFile, 'utf-8').split('\n');

const extract = (start, end) => lines.slice(start - 1, end).join('\n');

const overviewJSX = extract(224, 620);
const forecastJSX = extract(621, 845);
const qualityJSX = extract(846, 1043);
const opsJSX = extract(1044, 1220); // wait, let's find the exact end for ops

fs.writeFileSync(path.join(__dirname, 'overview_raw.tsx'), overviewJSX);
fs.writeFileSync(path.join(__dirname, 'forecast_raw.tsx'), forecastJSX);
fs.writeFileSync(path.join(__dirname, 'quality_raw.tsx'), qualityJSX);
fs.writeFileSync(path.join(__dirname, 'ops_raw.tsx'), opsJSX);
console.log("Extraction complete.");
