import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Connected to database:', process.env.DB_NAME);
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n==== DATABASE TABLES ====');
    
    if (tables.length === 0) {
      console.log('No tables found in the database');
    } else {
      // Get the property name from the first row
      const tablePropName = Object.keys(tables[0])[0];
      
      // Print table names
      for (const table of tables) {
        const tableName = table[tablePropName];
        console.log(`\n== TABLE: ${tableName} ==`);
        
        // Get columns for this table
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('Columns:');
        columns.forEach(col => {
          console.log(`- ${col.Field} (${col.Type})${col.Key === 'PRI' ? ' PRIMARY KEY' : ''}${col.Key === 'MUL' ? ' INDEX' : ''}`);
        });
        
        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`Row count: ${countResult[0].count}`);
        
        // If table is GameScores, print a sample
        if (tableName.toLowerCase() === 'gamescores') {
          const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 5`);
          console.log('Sample data:', sample);
        }
      }
    }
    
    // Check specifically for GameScores
    console.log('\n==== CHECKING FOR GameScores TABLE ====');
    try {
      const [gsCheck] = await connection.execute("SHOW TABLES LIKE 'GameScores'");
      if (gsCheck.length === 0) {
        console.log('GameScores table does not exist');
        
        // Suggest a statement to create it
        console.log('\nYou need to create the GameScores table. Here is the SQL:');
        
        // First find the Users table primary key
        const [userTables] = await connection.execute("SHOW TABLES LIKE 'Users'");
        if (userTables.length > 0) {
          const [userCols] = await connection.execute('DESCRIBE Users');
          const userPK = userCols.find(col => col.Key === 'PRI')?.Field || 'id';
          
          console.log(`
CREATE TABLE GameScores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(${userPK}) ON DELETE CASCADE
);

CREATE INDEX idx_game_scores_type_score ON GameScores(game_type, score DESC);
CREATE INDEX idx_game_scores_user_type ON GameScores(user_id, game_type);
          `);
        }
      } else {
        console.log('GameScores table exists');
      }
    } catch (error) {
      console.error('Error checking for GameScores:', error.message);
    }
    
    console.log('\n==== ANALYSIS COMPLETE ====');
    
  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

analyzeDatabase();