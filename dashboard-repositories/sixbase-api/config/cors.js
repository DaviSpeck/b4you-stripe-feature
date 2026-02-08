const cors = require('cors');
const logger = require('../utils/logger');

const allowedOrigins = [
  'https://dash.b4you.com.br',
  'https://sandbox-dash.b4you.com.br',
  'https://membros.b4you.com.br',
  'https://maratona-viral.b4you.com.br',
  'https://www.facebook.com',
  'https://facebook.com',
  'https://www.instagram.com',
  'https://instagram.com',
  'https://web.whatsapp.com',
  'https://wa.me',
  'https://graph.facebook.com',
  'https://developers.facebook.com'
];

module.exports = cors({
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      logger.warn(`[CORS BLOCKED] Origin bloqueado: ${origin}`);
      cb(new Error('Not allowed by CORS'));
    }
  },
});