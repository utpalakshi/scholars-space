// ── scholars-space/js/auth.js ──
// Demo auth using web-based JSON (localStorage as stand-in for JSON store)

const USERS_KEY = 'ss_users';
const SESSION_KEY = 'ss_session';

// Seed a default admin if none exist
function seedAdmin() {
    const users = getUsers().filter(u => u.role !== 'admin');
    users.push({ email: 'sixty@mail', password: 'sixty', role: 'admin', name: 'Admin' });
    saveUsers(users);
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentSession() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
}
function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Extract year from email like barakh.24bca@mail → "24" → year = 26-24 = 2nd year
function extractYear(email) {
    const match = email.match(/\.(\d{2})\D/);
    if (!match) return null;
    const batch = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear() % 100; // e.g. 26
    return currentYear - batch + 1; // 1-indexed year
}

function getRoleFromEmail(email) {
    if (email === 'sixty@mail') return 'admin';
    const year = extractYear(email);
    if (year === null) return 'junior';
    return year === 1 ? 'junior' : 'senior';
}

// Register: just add to JSON store
function register(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    const role = getRoleFromEmail(email);
    const user = { name, email, password, role };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user };
}

// Login: check JSON store
function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    setSession(user);
    return { ok: true, user };
}

seedAdmin();