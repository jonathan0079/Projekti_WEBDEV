-- Create the GameScores table if it doesn't exist
CREATE TABLE IF NOT EXISTS GameScores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create an index on game_type and score for faster leaderboard queries
CREATE INDEX idx_game_scores_type_score ON GameScores(game_type, score DESC);

-- Create an index on user_id and game_type for faster user history queries
CREATE INDEX idx_game_scores_user_type ON GameScores(user_id, game_type);