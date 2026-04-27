/* stations.js — Station management */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// GET all stations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Stations ORDER BY station_code');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single station
router.get('/:code', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Stations WHERE station_code = ?', [req.params.code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Station not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin CRUD
router.post('/', authorize(['Admin']), async (req, res) => {
  const { station_code, station_name, city, state } = req.body;
  try {
    await db.query(
      'INSERT INTO Stations (station_code, station_name, city, state) VALUES (?,?,?,?)',
      [station_code, station_name, city, state]
    );
    res.status(201).json({ message: 'Station added' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:code', authorize(['Admin']), async (req, res) => {
  const { station_name, city, state } = req.body;
  try {
    await db.query(
      'UPDATE Stations SET station_name=?, city=?, state=? WHERE station_code=?',
      [station_name, city, state, req.params.code]
    );
    res.json({ message: 'Station updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:code', authorize(['Admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM Stations WHERE station_code=?', [req.params.code]);
    res.json({ message: 'Station deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
