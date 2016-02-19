DROP TABLE IF EXISTS quizStatuses;
CREATE TABLE quizStatuses
(
    `quizStatusId`   INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `quizStatusName` VARCHAR(20) NOT NULL,
    `created`        TIMESTAMP,
    `modified`       TIMESTAMP
);
CREATE TRIGGER quizStatuses_insert BEFORE INSERT ON `quizStatuses` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;

BEGIN;
INSERT INTO `quizStatuses` VALUES ('1', 'Drafted', '2015-10-17 12:37:41', '0000-00-00 00:00:00'), ('2', 'Published', '2015-10-17 12:37:46', '0000-00-00 00:00:00'), ('3', 'Archived', '2015-10-17 12:37:50', '0000-00-00 00:00:00'), ('4', 'Deleted', '2015-10-17 12:37:54', '0000-00-00 00:00:00');
COMMIT;
