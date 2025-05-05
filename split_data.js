const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'scammers_data.json');
const rawData = fs.readFileSync(dataPath);
const originalData = JSON.parse(rawData);
const scammers = originalData.data;

const ITEMS_PER_FILE = 100;

const outputDir = path.join(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const totalFiles = Math.ceil(scammers.length / ITEMS_PER_FILE);

const fileIndex = [];

for (let i = 0; i < totalFiles; i++) {
  const startIndex = i * ITEMS_PER_FILE;
  const endIndex = Math.min((i + 1) * ITEMS_PER_FILE, scammers.length);
  const fileData = {
    data: scammers.slice(startIndex, endIndex)
  };
  
  const fileName = `scammers_${startIndex + 1}_${endIndex}.json`;
  const filePath = path.join(outputDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
  
  fileIndex.push({
    fileName,
    startId: fileData.data[0].id,
    endId: fileData.data[fileData.data.length - 1].id,
    count: fileData.data.length
  });
}

fs.writeFileSync(
  path.join(outputDir, 'index.json'),
  JSON.stringify({ files: fileIndex }, null, 2)
);

console.log(`Successfully divided the file into ${totalFiles} small file(s).`);
