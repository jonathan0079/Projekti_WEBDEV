-- Luo tietokantaan taulu GameScores, joka sisältää käyttäjän pelitulokset.
-- Tauluun tallennetaan käyttäjän id, pelin tyyppi, pelitulos ja luontiajankohta.
CREATE TABLE IF NOT EXISTS GameScores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);


CREATE INDEX idx_game_scores_type_score ON GameScores(game_type, score DESC);


CREATE INDEX idx_game_scores_user_type ON GameScores(user_id, game_type);