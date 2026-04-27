const express    = require('express');
const session    = require('express-session');
const cors       = require('cors');
const path       = require('path');

const trainRoutes      = require('./routes/trains');
const stationRoutes    = require('./routes/stations');
const delayStatsRoutes = require('./routes/delay_stats');
const delayPctRoutes   = require('./routes/delay_percentage');
const updateLogRoutes  = require('./routes/update_log');
const authRoutes       = require('./routes/authRoutes');
const reportRoutes     = require('./routes/reportRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'tdms_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }   // 8-hour session
}));

// ── Serve static frontend ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/trains',           trainRoutes);
app.use('/api/stations',         stationRoutes);
app.use('/api/delay-stats',      delayStatsRoutes);
app.use('/api/delay-percentage', delayPctRoutes);
app.use('/api/update-log',       updateLogRoutes);
app.use('/api/auth',             authRoutes);
app.use('/api/reports',          reportRoutes);

// ── Dashboard summary endpoint ─────────────────────────────────────────────
const db = require('./db');
app.get('/api/summary', async (req, res) => {
  try {
    const [[{ totalTrains }]]    = await db.query('SELECT COUNT(*) AS totalTrains FROM Trains');
    const [[{ totalStations }]]  = await db.query('SELECT COUNT(*) AS totalStations FROM Stations');
    const [[{ avgDelay }]]       = await db.query('SELECT ROUND(AVG(average_delay_minutes),2) AS avgDelay FROM Delay_Stats');
    
    // Most delayed train
    const [[maxTrain]] = await db.query(
      `SELECT t.train_name, ROUND(AVG(d.average_delay_minutes),2) AS avg_delay
       FROM Delay_Stats d JOIN Trains t ON d.train_num = t.train_num
       GROUP BY d.train_num ORDER BY avg_delay DESC LIMIT 1`
    );

    // Most affected station
    const [[maxStation]] = await db.query(
      `SELECT s.station_name, ROUND(AVG(d.average_delay_minutes),2) AS avg_delay
       FROM Delay_Stats d JOIN Stations s ON d.station_code = s.station_code
       GROUP BY d.station_code ORDER BY avg_delay DESC LIMIT 1`
    );

    // Performance stats
    const [[perf]] = await db.query(
      `SELECT 
        ROUND(AVG(pct_right_time),2) AS avgPunctuality,
        ROUND(AVG(pct_cancelled_unknown),2) AS avgCancelled
       FROM Delay_Percentage`
    );

    // Recent logs
    const [recentLogs] = await db.query(
      `SELECT ul.log_id, t.train_name, ul.train_num, ul.scraped_at
       FROM Update_Log ul JOIN Trains t ON ul.train_num = t.train_num
       ORDER BY ul.scraped_at DESC LIMIT 5`
    );

    res.json({ 
      totalTrains, 
      totalStations, 
      avgDelay, 
      maxDelayTrain: maxTrain,
      maxDelayStation: maxStation, 
      punctuality: perf.avgPunctuality,
      cancelled: perf.avgCancelled,
      recentLogs 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback — serve index.html ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚂 Train Delay Management System`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
