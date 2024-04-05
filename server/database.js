// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = path.resolve(__dirname, 'flashcards.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the flashcards database.');
});

// Database setup
const setupDatabase = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS flashcardresults (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            flashcard_id INTEGER NOT NULL,
            got_it BOOLEAN NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
        )`);
    });
};

module.exports = {
    db,
    setupDatabase
};
