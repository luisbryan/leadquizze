DROP TABLE IF EXISTS activity;
CREATE TABLE activity
(
    `activityId`             INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `quizId`                 INT(11) UNSIGNED NOT NULL,
    `quizCompleted`          INT NOT NULL DEFAULT 0,
    `quizResult`             VARCHAR(500),
    `leadCaptured`           INT NOT NULL DEFAULT 0,
    `ctaClicked`             INT NOT NULL DEFAULT 0,
    `shareCount`             INT NOT NULL DEFAULT 0,
    `firstName`              VARCHAR(100),
    `lastName`               VARCHAR(100),
    `email`                  VARCHAR(100),
    `phone`                  VARCHAR(25),
    `created`                TIMESTAMP,
    `modified`               TIMESTAMP
);
CREATE TRIGGER activity_insert BEFORE INSERT ON `activity` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
