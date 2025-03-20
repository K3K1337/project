const sqlite3 = require('sqlite3').verbose();

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    height REAL DEFAULT NULL,
    weight REAL DEFAULT NULL,
    gender TEXT DEFAULT NULL,
    age INTEGER DEFAULT NULL
)`;

const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');


    db.serialize(() => {
        db.run(INIT_SQL, (err) => {
            if (err) {
                console.error('Table creation failed:', err.message);
                return;
            }
            console.log('Verified users table structure');


            db.run(`
                CREATE INDEX IF NOT EXISTS idx_users_username 
                ON users (username)
            `);


            db.run(
                `INSERT OR IGNORE INTO users 
                (username, password) VALUES (?, ?)`,
                ['admin', 'password'],
                (err) => {
                    if (err) {
                        console.error('Test user creation failed:', err.message);
                    } else {
                        console.log('Test user ready (admin/password)');
                    }
                }
            );
        });
    });
});


db.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (err, row) => {
                err ? reject(err) : resolve(row);
            }
        );
    });
};

db.updateUserProfile = (userId, profileData) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET
                height = ?,
                weight = ?,
                gender = ?,
                age = ?
            WHERE id = ?`,
            [
                profileData.height,
                profileData.weight,
                profileData.gender,
                profileData.age,
                userId
            ],
            function(err) {
                err ? reject(err) : resolve(this.changes);
            }
        );
    });
};

module.exports = db;