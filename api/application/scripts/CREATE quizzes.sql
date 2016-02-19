DROP TABLE IF EXISTS quizzes;
CREATE TABLE quizzes
(
    `quizId`         INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `userId`         INT(11) UNSIGNED NOT NULL,
    `name`           VARCHAR(100),
    `status`         INT UNSIGNED NOT NULL,
    `title`          VARCHAR(100),
    `imageId`        VARCHAR(100),
    `description`    VARCHAR(500),
    `cta`            VARCHAR(100),
    `analyticsid`    VARCHAR(100),
    `integrationId`  INT(11) UNSIGNED,
    `segmentid`      VARCHAR(100),
    `quizLink`       VARCHAR(100),
    `hasSocialShare` INT,
    `hasStartPage`   INT,
    `created`        TIMESTAMP,
    `modified`       TIMESTAMP
);
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_userId_FK` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
CREATE TRIGGER quizzes_insert BEFORE INSERT ON `quizzes` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
