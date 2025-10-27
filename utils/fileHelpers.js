const fs = require('fs');
const path = require('path');

function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    if (fs.existsSync(absolute)) {
      fs.unlinkSync(absolute);
    }
  } catch (err) {
    console.error('safeUnlink error:', err.message);
  }
}

module.exports = { safeUnlink };
