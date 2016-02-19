DROP TABLE IF EXISTS integrations;
CREATE TABLE integrations
(
    `integrationId`          INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `userId`                 INT(11) UNSIGNED NOT NULL,
    `integrationVendorId`    INT(11) UNSIGNED NOT NULL,
    `username`               VARCHAR(100),
    `password`               VARCHAR(100),
    `apiKey`                 VARCHAR(100),
    `token`                  VARCHAR(100),
    `created`                TIMESTAMP,
    `modified`               TIMESTAMP
);
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_userId_FK` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `integrations` ADD CONSTRAINT `integrations_integrationVendors_FK` FOREIGN KEY (`integrationVendorId`) REFERENCES `integrationVendors` (`integrationVendorId`) ON DELETE CASCADE;
CREATE TRIGGER integrations_insert BEFORE INSERT ON `integrations` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
