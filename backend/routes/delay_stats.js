/* delay_stats.js — Delay stats with Filtering/Sorting */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// GET all delay stats (with Search/Filter/Sort)
router.get('/', async (req, res) => {
  const { train, station, minDelay, maxDelay, sortBy } = req.query;
  
  let sql = `
    SELECT d.*, t.train_name, s.station_name
    FROM Delay_Stats d
    JOIN Trains t ON d.train_num = t.train_num
    JOIN Stations s ON d.station_code = s.station_code
    WHERE 1=1
  `;
  
  let params = [];
  if (train) {
    sql += ` AND (d.train_num LIKE ? OR t.train_name LIKE ?)`;
    params.push(`%${train}%`, `%${train}%`);
  }
  if (station) {
    sql += ` AND (d.station_code = ? OR s.station_name LIKE ?)`;
    params.push(station, `%${station}%`);
  }
  if (minDelay) {
    sql += ` AND d.average_delay_minutes >= ?`;
    params.push(parseFloat(minDelay));
  }
  if (maxDelay) {
    sql += ` AND d.average_delay_minutes <= ?`;
    params.push(parseFloat(maxDelay));
  }

  if (sortBy === 'delay_desc') sql += ` ORDER BY d.average_delay_minutes DESC`;
  else if (sortBy === 'delay_asc') sql += ` ORDER BY d.average_delay_minutes ASC`;
  else sql += ` ORDER BY t.train_name ASC`;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin CRUD
router.post('/', authorize(['Admin', 'Station Manager']), async (req, res) => {
  const { train_num, station_code, average_delay_minutes } = req.body;
  try {
    await db.query(
      'INSERT INTO Delay_Stats (train_num, station_code, average_delay_minutes) VALUES (?,?,?)',
      [train_num, station_code, average_delay_minutes]
    );
    res.status(201).json({ message: 'Delay stat added' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authorize(['Admin', 'Station Manager']), async (req, res) => {
  const { average_delay_minutes } = req.body;
  try {
    await db.query(
      'UPDATE Delay_Stats SET average_delay_minutes=? WHERE stat_id=?',
      [average_delay_minutes, req.params.id]
    );
    res.json({ message: 'Delay stat updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authorize(['Admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM Delay_Stats WHERE stat_id=?', [req.params.id]);
    res.json({ message: 'Delay stat deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
