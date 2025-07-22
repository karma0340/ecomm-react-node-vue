// backend/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Returns a multer middleware configured to save uploads to /uploads/<folderName>
 * and only accepts image files.
 *
 * Usage in route:
 *   const getUpload = require('../middleware/upload');
 *   const upload = getUpload('avatars');
 *   router.put('/me', verifyToken, upload.single('avatar'), ... )
 */
function getUpload(folderName) {
  // Ensure /uploads/<folderName> exists
  const uploadDir = path.join(__dirname, '..', 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
      console.error('Failed to create upload directory:', uploadDir, e);
      throw new Error('Upload folder could not be created');
    }
  }

  // Multer storage: unique, safe, timestamped filenames
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/[^a-z0-9_\-]/gi, '_');
      cb(null, Date.now() + '-' + basename + ext.toLowerCase());
    }
  });

  // Image only filter
  const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  return multer({ storage, fileFilter });
}

module.exports = getUpload;
