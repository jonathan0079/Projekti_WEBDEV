import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Connected to database');
    
    // First, check if Users table exists and its structure
    const [tables] = await connection.execute("SHOW TABLES LIKE 'Users'");
    if (tables.length === 0) {
      console.error("Users table doesn't exist! Please create it first.");
      return;
    }
    
    // Check Users table structure
    const [userColumns] = await connection.execute("DESCRIBE Users");
    console.log("Users table structure:");
    userColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})${col.Key === 'PRI' ? ' (PRIMARY KEY)' : ''}`);
    });
    
    // Find the primary key field
    const primaryKey = userColumns.find(col => col.Key === 'PRI');
    if (!primaryKey) {
      console.error("Users table doesn't have a primary key!");
      return;
    }
    
    console.log(`Using ${primaryKey.Field} as the foreign key reference`);
    
    // Create GameScores table with correct foreign key
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS GameScores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        score INT NOT NULL,
        game_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(${primaryKey.Field}) ON DELETE CASCADE
      )
    `);
    
    console.log('GameScores table created or already exists');
    
    // Create indexes
    try {
      await connection.execute(`
        CREATE INDEX idx_game_scores_type_score ON GameScores(game_type, score DESC)
      `);
      console.log('Index idx_game_scores_type_score created');
    } catch (e) {
      console.log('Index may already exist:', e.message);
    }
    
    try {
      await connection.execute(`
        CREATE INDEX idx_game_scores_user_type ON GameScores(user_id, game_type)
      `);
      console.log('Index idx_game_scores_user_type created');
    } catch (e) {
      console.log('Index may already exist:', e.message);
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

setupDatabase();