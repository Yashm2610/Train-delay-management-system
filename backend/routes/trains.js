/* trains.js — Train management with Search/Sort */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// GET all trains (with Search/Sort)
router.get('/', async (req, res) => {
  const { search, sortBy } = req.query;
  let sql = `
    SELECT t.*, 
           s1.station_name AS source_name, 
           s2.station_name AS dest_name
    FROM Trains t
    LEFT JOIN Stations s1 ON t.source_station = s1.station_code
    LEFT JOIN Stations s2 ON t.destination_station = s2.station_code
  `;
  
  let params = [];
  if (search) {
    sql += ` WHERE t.train_num LIKE ? OR t.train_name LIKE ?`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sortBy === 'name') sql += ` ORDER BY t.train_name ASC`;
  else sql += ` ORDER BY t.train_num ASC`;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single train
router.get('/:num', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, s1.station_name AS source_name, s2.station_name AS dest_name
       FROM Trains t
       LEFT JOIN Stations s1 ON t.source_station = s1.station_code
       LEFT JOIN Stations s2 ON t.destination_station = s2.station_code
       WHERE t.train_num = ?`,
      [req.params.num]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Train not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin & User CRUD
router.post('/', authorize(['Admin', 'Station Manager', 'User']), async (req, res) => {
  const { train_num, train_name, source_station, destination_station, total_stations } = req.body;
  try {
    await db.query(
      'INSERT INTO Trains (train_num, train_name, source_station, destination_station, total_stations) VALUES (?,?,?,?,?)',
      [train_num, train_name, source_station, destination_station, total_stations || 1]
    );
    res.status(201).json({ message: 'Train added successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:num', authorize(['Admin']), async (req, res) => {
  const { train_name, source_station, destination_station, total_stations } = req.body;
  try {
    await db.query(
      'UPDATE Trains SET train_name=?, source_station=?, destination_station=?, total_stations=? WHERE train_num=?',
      [train_name, source_station, destination_station, total_stations, req.params.num]
    );
    res.json({ message: 'Train updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:num', authorize(['Admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM Trains WHERE train_num=?', [req.params.num]);
    res.json({ message: 'Train deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
