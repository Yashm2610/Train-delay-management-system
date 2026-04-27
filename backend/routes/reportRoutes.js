/* reportRoutes.js — CSV Export functionality */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// Helper to convert JSON to CSV
function toCSV(json) {
  if (json.length === 0) return '';
  const keys = Object.keys(json[0]);
  const header = keys.join(',') + '\n';
  const rows = json.map(row => 
    keys.map(key => `"${row[key]}"`).join(',')
  ).join('\n');
  return header + rows;
}

// Export train-wise report
router.get('/trains', authorize(['Admin', 'Station Manager']), async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.train_num, t.train_name, s1.station_name as source, s2.station_name as dest, t.total_stations 
      FROM Trains t 
      JOIN Stations s1 ON t.source_station = s1.station_code
      JOIN Stations s2 ON t.destination_station = s2.station_code
    `);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trains_report.csv');
    res.send(toCSV(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export station-wise report
router.get('/stations', authorize(['Admin', 'Station Manager']), async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Stations');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stations_report.csv');
    res.send(toCSV(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export delay stats report
router.get('/delays', authorize(['Admin', 'Station Manager']), async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.train_name, s.station_name, d.average_delay_minutes 
      FROM Delay_Stats d
      JOIN Trains t ON d.train_num = t.train_num
      JOIN Stations s ON d.station_code = s.station_code
    `);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=delays_report.csv');
    res.send(toCSV(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
