const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const { db, setupDatabase } = require('./database');
const verifyToken = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(verifyToken);

setupDatabase();

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

// Endpoint to get flashcards
app.get('/flashcards', (req, res) => {
    const filter = req.query.filter;
    const userId = req.userId; // This might be undefined if no token or an invalid token is provided

    let sql = "SELECT f.* FROM flashcards f";
    let params = [];

    // Adjust the query only if a user is logged in and a filter is requested
    if (userId && (filter === 'gotIt' || filter === 'morePractice')) {
        const gotItValue = filter === 'gotIt' ? 1 : 0;
        sql += " JOIN flashcardresults fr ON f.id = fr.flashcard_id WHERE fr.user_id = ? AND fr.got_it = ?";
        params = [userId, gotItValue];
    }

    // Execute the query with or without user-specific filtering
    db.all(sql, params, (err, rows) => {
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


// Endpoint to register flashcard response
app.post('/flashcardResponse', (req, res) => {
    const { username, flashcardId, gotIt } = req.body;

    // First, find the user_id that corresponds to the username
    const userSql = `SELECT id FROM users WHERE username = ?`;
    db.get(userSql, [username], (err, userRow) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!userRow) {
            res.status(404).json({ "error": "User not found" });
            return;
        }

        // Then, insert the flashcard response using the user_id
        const responseSql = `INSERT INTO flashcardresults (user_id, flashcard_id, got_it) VALUES (?, ?, ?)`;
        db.run(responseSql, [userRow.id, flashcardId, gotIt], function (err) {
            if (err) {
                res.status(500).json({ "error": err.message });
                return;
            }

            console.log(`flashcardResponse table updated with username: ${username}, User ID: ${userRow.id}, Flashcard ID: ${flashcardId}, Got it?: ${gotIt}`);

            res.json({
                message: 'Success',
                data: { id: this.lastID },
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
