DROP TABLE IF EXISTS userStatuses;
CREATE TABLE userStatuses
(
    `userStatusId`   INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `userStatusName` VARCHAR(20) NOT NULL,
    `created`        TIMESTAMP,
    `modified`       TIMESTAMP
);
CREATE TRIGGER userStatuses_insert BEFORE INSERT ON `userStatuses` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;

BEGIN;
INSERT INTO `userStatuses` VALUES ('1', 'Active', '2015-10-17 12:37:41', '0000-00-00 00:00:00'), ('2', 'Suspended', '2015-10-17 12:37:46', '0000-00-00 00:00:00'), ('3', 'Deleted', '2015-10-17 12:37:50', '0000-00-00 00:00:00');
COMMIT;
