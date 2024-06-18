const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      reservation_date TEXT NOT NULL,
      people_count INTEGER NOT NULL,
      soup1 TEXT,
      soup2 TEXT,
      soup3 TEXT,
      appetizers_1 TEXT,
      appetizers_2 TEXT,
      main_course1 TEXT,
      main_course2 TEXT,
      main_course3 TEXT,
      deluxe_1 TEXT,
      steak_1 TEXT,
      dessert_1 TEXT,
      dessert_2 TEXT,
      icecream_plus TEXT,
      drink_1 TEXT,
      drink_2 TEXT,
      drink_3 TEXT
    )
  `);
});

db.close();
console.log('Database setup complete.');
