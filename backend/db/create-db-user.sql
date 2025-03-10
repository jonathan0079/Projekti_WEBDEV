-- User creation example, replace 'healthuser' & 'password'
CREATE USER 'healthuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON `HealthDiary`.* TO 'healthuser'@'localhost';
FLUSH PRIVILEGES;