
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON `HealthDiary`.* TO 'root'@'localhost';
FLUSH PRIVILEGES;