DROP TABLE IF EXISTS offers;
CREATE TABLE offers
(
    `offerId`            INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `outcomeId`          INT(11) UNSIGNED NOT NULL,
    `offerEnabled`       INT UNSIGNED NOT NULL,
    `offerType`          INT UNSIGNED NOT NULL,
    `offerHeadline`      VARCHAR(100),
    `offerDescription`   VARCHAR(500),
    `offerCta`           VARCHAR(10),
    `offerUrl`           VARCHAR(500),
    `offerImage`         VARCHAR(500),
    `created`            TIMESTAMP,
    `modified`           TIMESTAMP
);
ALTER TABLE `offers` ADD CONSTRAINT `offers_outcomeId_FK` FOREIGN KEY (`outcomeId`) REFERENCES `outcomes` (`outcomeId`) ON DELETE CASCADE;
CREATE TRIGGER offers_insert BEFORE INSERT ON `offers` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
