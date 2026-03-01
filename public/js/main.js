const API_BASE = '/api';

/**
 * Format date nicely
 * @param {string} dateString 
 */
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Extract just the day and month for the badge
 */
function getBadgeDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return { day, month };
}

/**
 * Fetch all events and render them on the home page
 */
async function fetchEvents() {
    const container = document.getElementById('events-container');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('error-message');

    if (!container) return; // Not on the home page

    try {
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) throw new Error('Failed to load events');

        const events = await response.json();
        loader.style.display = 'none';

        if (events.length === 0) {
            container.innerHTML = '<div class="glass-panel text-center" style="grid-column: 1 / -1;"><p>No upcoming events found. Check back later!</p></div>';
            return;
        }

        container.innerHTML = events.map(event => {
            const dateBadge = getBadgeDate(event.date);
            return `
                <div class="event-card">
                    <div class="event-card-header">
                        <div class="event-date-badge">
                            <div style="font-size: 1.5rem;">${dateBadge.day}</div>
                            <div style="font-size: 0.8rem; text-transform: uppercase;">${dateBadge.month}</div>
                        </div>
                    </div>
                    <div class="event-card-body">
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span>🕒 ${formatDate(event.date)}</span>
                        </div>
                        <div class="event-meta">
                            <span>📍 ${event.location || 'TBA'}</span>
                        </div>
                        <p>${event.description ? event.description.substring(0, 100) + '...' : 'No description provided.'}</p>
                    </div>
                    <div class="event-card-footer flex justify-between items-center">
                        <span style="font-size: 0.9rem; color: var(--text-muted)">
                            ${event.capacity ? `Capacity: ${event.capacity}` : 'Open to all'}
                        </span>
                        <a href="/register.html?id=${event.id}" class="btn btn-primary">Register Now</a>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        loader.style.display = 'none';
        errorMsg.textContent = 'Failed to load events. Ensure backend is running.';
        errorMsg.style.display = 'block';
    }
}
