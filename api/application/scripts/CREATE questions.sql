DROP TABLE IF EXISTS questions;
CREATE TABLE questions
(
    `questionId`     INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `quizId`         INT(11) UNSIGNED NOT NULL,
    `questionText`   VARCHAR(150),
    `answerStructA`  VARCHAR(8000),
    `answerStructB`  VARCHAR(8000),
    `answerStructC`  VARCHAR(8000),
    `answerStructD`  VARCHAR(8000),
    `answerStructE`  VARCHAR(8000),
    `created`        TIMESTAMP,
    `modified`       TIMESTAMP
);
ALTER TABLE `questions` ADD CONSTRAINT `questions_quizId_FK` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`quizId`) ON DELETE CASCADE;
CREATE TRIGGER questions_insert BEFORE INSERT ON `questions` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
