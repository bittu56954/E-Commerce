import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import './Models/db.js';
import authRouter from './Routers/authRouter.js';
import contactRouter from './Routers/contactRouter.js';
import dashboardRouter from './Routers/dashboardRouter.js';
import productRouter from './Routers/productRouter.js';
import orderRouter from './Routers/orderRouter.js';
import categoryRouter from './Routers/categoryRouter.js';
import settingsRouter from './Routers/settingsRouter.js';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { nosqlInjectionGuard, xssSanitizer, csrfProtection } from './Middleware/security.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet for Secure HTTP Headers (disabling contentSecurityPolicy in development if needed, or keeping default)
app.use(helmet({
  contentSecurityPolicy: false // Keep it false to make sure front-end dynamic assets from dev server loads properly
}));

// Apply cookie parser for secure cookie reading
app.use(cookieParser());

// Rate Limiting to prevent Brute-Force and DoS attempts
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 auth requests per minute
  message: { error: 'Too many login or registration attempts. Please wait 1 minute.' }
});

// Apply Global Rate Limiter
app.use(globalLimiter);

// Parse JSON payloads
app.use(express.json());

// Apply Custom Sanitizers & Security Filters
app.use(nosqlInjectionGuard);
app.use(xssSanitizer);
app.use(csrfProtection);

// Apply Auth Rate Limiter specifically to login/register routes
app.use('/api/auth', authLimiter);

// Enable CORS with support for credentials
app.use(cors({
  origin: true,
  credentials: true
}));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// API Routes
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'zomato backend engine is online.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Exception inside E-Commerce gateway.' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛒 ZOMATO E-COMMERCE SERVER RUNNING: http://localhost:${PORT}`);
  console.log(`🔑 AUTH STACK: JWT Encryption Handshake Active`);
  console.log(`📂 PERSISTENCE: Local JSON Document Storage (data/*.json)`);
  console.log(`====================================================`);
});
