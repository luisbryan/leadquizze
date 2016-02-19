DROP TABLE IF EXISTS captureSettings;
CREATE TABLE captureSettings
(
    `captureSettingsId`             INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `quizId`                        INT(11) UNSIGNED NOT NULL,
    `captureEnabled`                INT NOT NULL,
    `leadType`                      INT(11) UNSIGNED NOT NULL,

    `socialCaptureHeadline`         VARCHAR(100),
    `socialCaptureDescription`      VARCHAR(500),
    `socialCapturePlacement`        VARCHAR(10),
    `socialCaptureSkippable`        INT NOT NULL,
    `socialCapturePrivacyPolicy`    VARCHAR(500),
    `socialCaptureDisclaimerUrl`    VARCHAR(100),

    `leadCaptureHeadline`           VARCHAR(100),
    `leadCaptureDescription`        VARCHAR(100),
    `leadCapturePlacement`          VARCHAR(100),
    `leadCaptureCta`                VARCHAR(100),
    `leadCaptureFirstEnabled`       INT NOT NULL,
    `leadCaptureLastEnabled`        INT NOT NULL,
    `leadCaptureEmailEnabled`       INT NOT NULL,
    `leadCapturePhoneEnabled`       INT NOT NULL,
    `leadCaptureSkippable`          INT NOT NULL,
    `leadCaptureConversionCode`     VARCHAR(8000),
    `leadCapturePrivacyPolicy`      VARCHAR(500),
    `leadCaptureDisclaimerUrl`      VARCHAR(100),

    `created`                       TIMESTAMP,
    `modified`                      TIMESTAMP
);
ALTER TABLE `captureSettings` ADD CONSTRAINT `captureSettings_quizId_FK` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`quizId`) ON DELETE CASCADE;
CREATE TRIGGER captureSettings_insert BEFORE INSERT ON `captureSettings` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;
