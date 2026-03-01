const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Create a new event
router.post('/', async (req, res) => {
    const { title, description, date, location, capacity } = req.body;

    // Basic validation
    if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO events (title, description, date, location, capacity) VALUES (?, ?, ?, ?, ?)',
            [title, description, date, location, capacity || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

module.exports = router;
