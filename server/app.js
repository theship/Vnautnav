const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;

require('dotenv').config();

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
    // Create flashcards table
    db.run(`CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )`);

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    // Create flashcardresults table
    db.run(`CREATE TABLE IF NOT EXISTS flashcardresults (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      flashcard_id INTEGER NOT NULL,
      got_it BOOLEAN NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    )`);

    // Check if flashcards table is empty before inserting initial data
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

// Function to add a new user
const saltRounds = 10;

function addUser(username, password) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            console.error('Hashing error:', err);
            return;
        }
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`A new user has been added with ID ${this.lastID}`);
            }
        });
    });
}

// Endpoint for user registration
// Endpoint for user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? true : false);
                }
            });
        });

        if (userExists) {
            return res.status(400).send("User already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
            if (err) {
                return res.status(500).send("Error creating user.");
            }
            console.log(`A new user has been added with username: ${username}`); // Log for debugging
            return res.status(201).send("User created successfully");
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).send("An error occurred during registration.");
    }
});

// Endpoint for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            // Handle database error
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!user) {
            // No user found with the username
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Use bcrypt.compare to check password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                // Handle bcrypt error
                res.status(500).json({ error: 'Error checking password' });
                return;
            }

            if (result) {
                // Passwords match, proceed to generate the token
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

                console.log(`User logged in: ${user.username}`);

                // Send back the username and token
                res.json({
                    username: user.username,
                    token: token
                });
            } else {
                // Passwords don't match
                res.status(401).json({ error: 'Invalid username or password' });
            }
        });
    });
});

// Existing endpoint to get flashcards
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
