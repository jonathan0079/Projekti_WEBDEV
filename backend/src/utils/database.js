import mysql from 'mysql2';
import 'dotenv/config';

// Luo yhteyspooli
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testaa tietokantayhteys
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Tietokantayhteys epäonnistui:', err);
  } else {
    console.log('Tietokanta yhdistetty onnistuneesti');
    connection.release();
  }
});

// Vie promise-pohjainen pooli async/await käyttöä varten
const promisePool = pool.promise();
export default promisePool;