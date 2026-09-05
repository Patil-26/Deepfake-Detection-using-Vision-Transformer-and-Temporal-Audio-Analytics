import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

import authRoutes from './routes/auth.js';
import toolsRoutes from './routes/tools.js';
import subscriptionRoutes from './routes/subscription.js';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('RealEyes API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
