const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');
const chatRoutes = require('./routes/chat');   // FIXED

dotenv.config();

const app = express();   // app first create cheyyanam

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Chatbot Route
app.use("/api/chat", chatRoutes);   // moved after app created

// MongoDB Connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/pollution-health-db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pollution', authMiddleware, require('./routes/pollution'));
app.use('/api/health', require('./routes/health'));
app.use('/api/history', authMiddleware, require('./routes/history'));
app.use('/api/analytics', authMiddleware, require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));

// Health Check Route
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});