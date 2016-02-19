DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    `id`          INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`        VARCHAR(255) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `email`       VARCHAR(255) NOT NULL,
    `phone`       VARCHAR(255) NOT NULL,
    `website`     VARCHAR(255) NOT NULL,
    `userLogo`    VARCHAR(255),
    `password`    VARCHAR(255) NOT NULL,
    `roleId`      INT DEFAULT 0,
    `statusId`    INT DEFAULT 1,
    `created`     TIMESTAMP,
    `modified`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TRIGGER users_insert BEFORE INSERT ON `users` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;

BEGIN;
INSERT INTO `users` VALUES ('1', 'Admin', 'Yazamo', 'admin@yazamo.com', '5555555555', 'yazamo.com', 'sha256:1024:9B6fZeaMKtnTcehFlFBdWh7vaT81FdCx:j79EwzphF5t6ZdF7XNe1Yf5NXN/XjH6M', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
COMMIT;