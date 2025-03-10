import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Importtaa reitit
import authRouter from './routes/auth-routes.js';
import diaryRouter from './routes/diary-router.js';
import gameRouter from './routes/game-router.js';

// Luo Express-sovelluksen
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API:n juurireitti, joka palauttaa yleiskatsauksen saatavilla olevista rajapinnoista
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

// Reitit
app.use('/api/auth', authRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/game', gameRouter);

// Perus root reitti
app.get('/', (req, res) => {
  res.json({ message: 'Health Diary API Server is running' });
});

// Virheiden käsittely middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Reitti ei löydy - middleware 404
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