// backend/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

function getUpload(folderName) {
  // Ensure the upload directory exists
  const uploadDir = path.join(__dirname, '..', 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Set up storage engine
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  // File filter (optional, only allow images)
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  return multer({ storage, fileFilter });
}

module.exports = getUpload;
