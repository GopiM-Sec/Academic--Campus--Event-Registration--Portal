const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const eventsRoutes = require('./routes/events');
const registrationsRoutes = require('./routes/registrations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);

// General Route for unmatched paths (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
