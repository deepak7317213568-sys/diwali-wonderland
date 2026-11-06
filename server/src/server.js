import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';
import referralRoutes from './routes/referralRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Resolve DNS SRV queries via Google & Cloudflare Public DNS to bypass local ISP/router SRV blocks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Safe fallback to system defaults
}

// Load the server's .env file regardless of the folder used to start Node.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like same-domain rewrites, mobile apps or curl) or matching origins
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// Ensure database connection is initialized for incoming requests
app.use(async (req, res, next) => {
  if (MONGO_URI && mongoose.connection.readyState === 0) {
    try {
      await connectDB();
    } catch (e) {
      // safe fallback to in-memory store
    }
  }
  next();
});

// Global rate limiting
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/referrals', referralRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/in-memory-mode';
  res.status(200).json({
    status: 'healthy',
    project: 'DIWALI WONDERLAND API',
    creator: 'Deepak Prajapati',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Connect to MongoDB Atlas if URI is provided
export const connectDB = async () => {
  if (!MONGO_URI) {
    console.log('ℹ️  No MONGO_URI provided in environment. Running with in-memory store (demo mode).');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✨ Connected successfully to MongoDB Atlas database!');
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas connection error. Falling back gracefully to in-memory store:', error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🪔 Diwali Wonderland server running on port ${PORT}`);
    });
  });
}

export default app;
