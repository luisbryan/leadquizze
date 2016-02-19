DROP TABLE IF EXISTS acl;
CREATE TABLE acl
(
    `key`      VARCHAR(255) NOT NULL,
    `value`    TEXT NOT NULL,
    `created`  TIMESTAMP,
    `modified` TIMESTAMP
);
CREATE TRIGGER acl_insert BEFORE INSERT ON `acl` FOR EACH ROW SET NEW.created = CURRENT_TIMESTAMP;

BEGIN;
INSERT INTO `acl` VALUES ('resources', '[\"administrator\",\"user\",\"role\",\"resource\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('resource_role_permissions::administrator::administrator', '[\"read\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('resource_role_permissions::resource::administrator', '[\"create\",\"read\",\"update\",\"delete\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('resource_role_permissions::role::administrator', '[\"create\",\"read\",\"update\",\"delete\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('resource_role_permissions::user::administrator', '[\"create\",\"read\",\"update\",\"delete\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('roles', '[\"administrator\"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
COMMIT;