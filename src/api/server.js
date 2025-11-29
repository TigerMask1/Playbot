const express = require('express');
const session = require('express-session');
const path = require('path');
const { connect } = require('../core/database');

const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const characterRoutes = require('./routes/characters');
const moveRoutes = require('./routes/moves');
const economyRoutes = require('./routes/economy');
const crateRoutes = require('./routes/crates');
const questRoutes = require('./routes/quests');
const jobRoutes = require('./routes/jobs');
const dropRoutes = require('./routes/drops');
const battleRoutes = require('./routes/battles');
const eventRoutes = require('./routes/events');
const playerRoutes = require('./routes/players');
const auditRoutes = require('./routes/audit');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'playbot-dashboard-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '../dashboard/public')));

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/moves', moveRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/crates', crateRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function startServer() {
  try {
    await connect();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PlayBot Dashboard running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

module.exports = { app, startServer };
