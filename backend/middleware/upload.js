// /middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function getUpload(subfolder = 'products') {
  // Ensure the upload directory exists
  const uploadDir = path.join(__dirname, `../public/images/${subfolder}`);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Multer storage config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
  });

  // Only accept image files
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  // 5MB file size limit (adjust as needed)
  const limits = { fileSize: 5 * 1024 * 1024 };

  return multer({ storage, fileFilter, limits });
}

module.exports = getUpload;
