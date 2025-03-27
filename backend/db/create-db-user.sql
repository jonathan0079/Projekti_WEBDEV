
CREATE USER 'healthuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON `HealthDiary`.* TO 'healthuser'@'localhost';
FLUSH PRIVILEGES;