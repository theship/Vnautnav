const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const db = new sqlite3.Database('./flashcards.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the flashcards database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  )`);

    // Check if table is empty before inserting
    db.get("SELECT COUNT(*) AS count FROM flashcards", (err, row) => {
        if (err) {
            console.error(err.message);
        } else if (row.count === 0) { // Only insert if the table is empty
            const csvFilePath = 'data/nav-rule.csv';

            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    db.run('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [row.question, row.answer], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }
                        console.log(`A row has been inserted with rowid ${this.lastID}`);
                    });
                })
                .on('end', () => {
                    console.log('CSV file successfully processed and data inserted into the database.');
                });
        }
    });
});

app.get('/flashcards', (req, res) => {
    const sql = "SELECT * FROM flashcards";

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
