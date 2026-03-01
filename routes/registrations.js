const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register a user for an event
router.post('/', async (req, res) => {
    const { event_id, name, email, student_id } = req.body;

    if (!event_id || !name || !email) {
        return res.status(400).json({ error: 'Event ID, Name, and Email are required' });
    }

    try {
        // Start a transaction or simply do consecutive queries for this simple case
        // 1. Check or Insert User
        let user_id;
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            user_id = existingUsers[0].id;
        } else {
            const [newUser] = await db.query(
                'INSERT INTO users (name, email, student_id) VALUES (?, ?, ?)',
                [name, email, student_id || null]
            );
            user_id = newUser.insertId;
        }

        // 2. Check Event Capacity (Optional Enhancement)
        const [events] = await db.query('SELECT capacity FROM events WHERE id = ?', [event_id]);
        if (events.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Count current registrations
        const [registrations] = await db.query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [event_id]);
        if (events[0].capacity && registrations[0].count >= events[0].capacity) {
            return res.status(400).json({ error: 'Event is at full capacity' });
        }

        // 3. Register for Event
        await db.query(
            'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
            [event_id, user_id]
        );

        res.status(201).json({ message: 'Successfully registered for the event' });

    } catch (err) {
        console.error(err);
        // Handle unique constraint violation (duplicate entry)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'You are already registered for this event' });
        }
        res.status(500).json({ error: 'Failed to process registration' });
    }
});

// Get registrations for a specific event
router.get('/event/:event_id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.id, r.registered_at, u.name, u.email, u.student_id 
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.registered_at DESC
        `, [req.params.event_id]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

module.exports = router;
