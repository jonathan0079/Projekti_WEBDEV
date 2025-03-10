import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Import routers
import authRouter from './routes/auth-routes.js';
import diaryRouter from './routes/diary-router.js';
import gameRouter from './routes/game-router.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for API root
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Health Diary API',
    endpoints: {
      auth: '/api/auth',
      diary: '/api/diary',
      game: '/api/game'
    }
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/game', gameRouter);

// Basic root route
app.get('/', (req, res) => {
  res.json({ message: 'Health Diary API Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Route not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});