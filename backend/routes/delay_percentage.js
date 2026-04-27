/* delay_percentage.js — Performance metrics */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// GET all performance metrics
router.get('/', async (req, res) => {
  const { train, station } = req.query;
  let sql = `
    SELECT p.*, t.train_name, s.station_name
    FROM Delay_Percentage p
    JOIN Trains t ON p.train_num = t.train_num
    JOIN Stations s ON p.station_code = s.station_code
    WHERE 1=1
  `;
  let params = [];
  if (train) {
    sql += ` AND p.train_num = ?`;
    params.push(train);
  }
  if (station) {
    sql += ` AND p.station_code = ?`;
    params.push(station);
  }
  sql += ` ORDER BY p.pct_right_time DESC`;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin CRUD
router.post('/', authorize(['Admin', 'Station Manager']), async (req, res) => {
  const { train_num, station_code, pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown } = req.body;
  try {
    await db.query(
      `INSERT INTO Delay_Percentage 
       (train_num, station_code, pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown) 
       VALUES (?,?,?,?,?,?)`,
      [train_num, station_code, pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown]
    );
    res.status(201).json({ message: 'Performance record added' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authorize(['Admin', 'Station Manager']), async (req, res) => {
  const { pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown } = req.body;
  try {
    await db.query(
      `UPDATE Delay_Percentage SET 
       pct_right_time=?, pct_slight_delay=?, pct_significant_delay=?, pct_cancelled_unknown=? 
       WHERE pct_id=?`,
      [pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown, req.params.id]
    );
    res.json({ message: 'Performance record updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authorize(['Admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM Delay_Percentage WHERE pct_id=?', [req.params.id]);
    res.json({ message: 'Performance record deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
