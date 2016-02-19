DROP TABLE IF EXISTS integrationVendors;
CREATE TABLE integrationVendors
(
    `integrationVendorId`    INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `vendorName`             VARCHAR(100) NOT NULL,
    `vendorReferenceName`    VARCHAR(100) NOT NULL,
    `oauthKey`               VARCHAR(200),
    `oauthSecret`            VARCHAR(200),
    `active`                 INT UNSIGNED NOT NULL DEFAULT 1,
    `created`                TIMESTAMP,
    `modified`               TIMESTAMP
);
CREATE TRIGGER integrationVendors_insert BEFORE INSERT ON `integrationVendors` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
