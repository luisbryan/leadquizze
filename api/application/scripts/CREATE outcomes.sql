DROP TABLE IF EXISTS outcomes;
CREATE TABLE outcomes
(
    `outcomeId`      INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `quizId`         INT(11) UNSIGNED NOT NULL,
    `title`          VARCHAR(100),
    `body`           VARCHAR(8000),
    `created`        TIMESTAMP,
    `modified`       TIMESTAMP
);
ALTER TABLE `outcomes` ADD CONSTRAINT `outcomes_userId_FK` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`quizId`) ON DELETE CASCADE;
CREATE TRIGGER outcomes_insert BEFORE INSERT ON `outcomes` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
