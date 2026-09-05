import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  fileHash: {
    type: String,
    required: true,
  },
  aiVerdict: {
    type: String,
    required: true,
  },
  aiConfidence: {
    type: Number,
    required: true,
  },
  userVerdict: {
    type: String,
    enum: ['REAL', 'FAKE'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
