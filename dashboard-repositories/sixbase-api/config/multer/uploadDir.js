const path = require('path');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '..', '..', 'tmp', 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = uploadsDir;
