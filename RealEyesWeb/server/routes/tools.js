import express from 'express';
import multer from 'multer';
import { 
  detectImage, 
  detectVideo, 
  detectAudio, 
  submitFeedback 
} from '../controllers/toolsController.js';

const router = express.Router();

// 1. Image upload configuration - 10MB limit
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'), false);
    }
  }
});

// 2. Video upload configuration - 50MB limit
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, WEBM, AVI, MOV) are allowed'), false);
    }
  }
});

// 3. Audio upload configuration - 25MB limit
const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (WAV, MP3, OGG, WEBM, AAC) are allowed'), false);
    }
  }
});

// Wrapper middleware to handle Multer payload limit errors cleanly
const handleMulter = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: `Payload too large. File exceeds allowed size limit.` 
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Endpoints
router.post('/detect-image', handleMulter(uploadImage.single('image')), detectImage);
router.post('/detect-video', handleMulter(uploadVideo.single('video')), detectVideo);
router.post('/detect-audio', handleMulter(uploadAudio.single('audio')), detectAudio);
router.post('/feedback', submitFeedback);

export default router;
