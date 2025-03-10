-- tämä luo tietokannan ja taulut, joita käytetään HealthDiary-sovelluksessa
-- Taulut: Users, DiaryEntries, GameScores
DROP DATABASE IF EXISTS HealthDiary;
CREATE DATABASE HealthDiary;

USE HealthDiary;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_level VARCHAR(10) DEFAULT 'regular'
);

CREATE TABLE DiaryEntries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    mood VARCHAR(50),
    weight DECIMAL(5,2),
    sleep_hours INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create GameScores table for the clicking game
CREATE TABLE IF NOT EXISTS GameScores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_game_scores_type_score ON GameScores(game_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_type ON GameScores(user_id, game_type);


-- Insert sample user for testing
INSERT INTO Users (username, password, email, user_level) 
VALUES ('testuser', '$2b$10$YmBlOQqm5Oy8Mms4iw1qA.w1iRgZ5WkE0pY0kUw1RVZnFoyWSIo.2', 'test@example.com', 'regular');