import express from 'express';
import multer from 'multer';
import { detectImage, submitFeedback, detectVideo, tempUpload } from '../controllers/toolsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/detect-image', upload.single('image'), detectImage);
router.post('/detect-video', upload.single('video'), detectVideo);
router.post('/feedback', submitFeedback);
router.post('/temp-upload', upload.single('image'), tempUpload);

export default router;
