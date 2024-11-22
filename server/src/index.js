import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT, CORS_ORIGIN } from './config/index.js';
import worksheetRoutes from './routes/worksheet.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', worksheetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`CORS enabled for origin: ${CORS_ORIGIN}`);
  console.log('OpenAI API Key status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
});
