import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Configure multer for memory storage (we'll upload to Cloudinary directly)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        )
      );
    }
  },
});

// All upload routes require authentication
router.use(authenticate);

// Upload a single image
router.post('/image', upload.single('image'), (req, res) =>
  uploadController.uploadImage(req, res)
);

// Delete an image
router.delete('/image/:publicId', (req, res) =>
  uploadController.deleteImage(req, res)
);

export default router;
