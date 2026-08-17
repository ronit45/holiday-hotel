const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/AnalyticsDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
let activeTabLines = [];

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('activeTab === "overview"')) activeTabLines.push({tab: 'overview', line: i+1});
    if (lines[i].includes('activeTab === "forecast"')) activeTabLines.push({tab: 'forecast', line: i+1});
    if (lines[i].includes('activeTab === "ops"')) activeTabLines.push({tab: 'ops', line: i+1});
    if (lines[i].includes('activeTab === "quality"')) activeTabLines.push({tab: 'quality', line: i+1});
}

console.log(JSON.stringify(activeTabLines, null, 2));
