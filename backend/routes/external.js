/* external.js — External API Integrations (Live Status & IRCTC) */
const express = require('express');
const router  = express.Router();

// Configuration
const MOCK_MODE = process.env.LIVE_DATA_MODE !== 'API';
const RAPID_API_KEY = process.env.RAPID_API_KEY || '';

/**
 * GET /api/external/live-status/:trainNum
 * Returns real-time location and delay info
 */
router.get('/live-status/:trainNum', async (req, res) => {
  const { trainNum } = req.params;

  if (MOCK_MODE) {
    // Return sample data for demonstration
    return res.json({
      success: true,
      mode: 'mock',
      train_num: trainNum,
      current_station: 'ADI',
      status: 'Running Late',
      delay: 15,
      last_updated: new Date().toISOString(),
      route: [
        { station: 'NDLS', name: 'New Delhi', eta: '16:30', ata: '16:35', status: 'Departed' },
        { station: 'MTJ',  name: 'Mathura',   eta: '18:15', ata: '18:25', status: 'Departed' },
        { station: 'KOTA', name: 'Kota',      eta: '21:00', ata: '21:15', status: 'Departed' },
        { station: 'RTM',  name: 'Ratlam',    eta: '01:20', ata: '01:40', status: 'Departed' },
        { station: 'ADI',  name: 'Ahmedabad', eta: '05:40', ata: '06:05', status: 'Arrived' },
        { station: 'BRC',  name: 'Vadodara',  eta: '07:30', ata: '--',    status: 'Upcoming' },
        { station: 'MMCT', name: 'Mumbai',     eta: '12:10', ata: '--',    status: 'Upcoming' }
      ]
    });
  }

  // Real API Logic (Placeholder for user to implement with their specific provider)
  try {
    // Example for a RapidAPI provider using native fetch
    /*
    const response = await fetch(`https://indian-railway-api.p.rapidapi.com/liveStatus?trainNum=${trainNum}`, {
      headers: { 'X-RapidAPI-Key': RAPID_API_KEY }
    });
    const data = await response.json();
    res.json(data);
    */
    res.status(501).json({ error: 'Live API key not configured. Enable MOCK_MODE for testing.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/external/irctc-link/:trainNum
 * Generates a deep-link for booking
 */
router.get('/irctc-link/:trainNum', (req, res) => {
  const { trainNum } = req.params;
  // Standard IRCTC search URL pattern (approximate)
  const link = `https://www.irctc.co.in/nget/booking/train-list?trainNo=${trainNum}`;
  res.json({ url: link });
});

module.exports = router;
