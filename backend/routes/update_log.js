/* update_log.js — System logs */
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { authorize } = require('../middleware/authMiddleware');

// GET all logs
router.get('/', async (req, res) => {
  const { train } = req.query;
  let sql = `
    SELECT ul.*, t.train_name
    FROM Update_Log ul
    JOIN Trains t ON ul.train_num = t.train_num
  `;
  let params = [];
  if (train) {
    sql += ` WHERE ul.train_num = ?`;
    params.push(train);
  }
  sql += ` ORDER BY ul.scraped_at DESC LIMIT 100`;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin can add logs
router.post('/', authorize(['Admin']), async (req, res) => {
  const { train_num, scraped_at } = req.body;
  try {
    await db.query(
      'INSERT INTO Update_Log (train_num, scraped_at) VALUES (?,?)',
      [train_num, scraped_at || new Date()]
    );
    res.status(201).json({ message: 'Log entry added successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin can delete logs
router.delete('/:id', authorize(['Admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM Update_Log WHERE log_id=?', [req.params.id]);
    res.json({ message: 'Log deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
