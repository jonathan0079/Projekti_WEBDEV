import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Tuo reitittimet
import authRouter from './routes/auth-routes.js';
import diaryRouter from './routes/diary-router.js';
import gameRouter from './routes/game-router.js';

// Luo Express sovellus
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Perusreitti API:n juurelle
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Tervetuloa Terveyspäiväkirja API:in',
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

// Perusjuurireitti
app.get('/', (req, res) => {
  res.json({ message: 'Terveyspäiväkirja API-palvelin on käynnissä' });
});

// Virheidenkäsittely middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Palvelinvirhe',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Reittiä ei löydy käsittelijä
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Reittiä ei löydy: ${req.method} ${req.originalUrl}`
  });
});

// Käynnistä palvelin
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
  console.log(`API saatavilla osoitteessa http://localhost:${PORT}/api`);
});