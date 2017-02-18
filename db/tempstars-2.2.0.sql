ALTER TABLE `PartialOffer`
ADD COLUMN `hourlyRate` DECIMAL(6,2) NULL AFTER `statusChangeOn`;

ALTER TABLE `Hygienist`
ADD COLUMN `cdhoStatus` VARCHAR(20) NULL AFTER `placements`,
ADD COLUMN `school` VARCHAR(100) NULL AFTER `cdhoStatus`,
ADD COLUMN `graduationYear` YEAR NULL AFTER `school`,
ADD COLUMN `languages` VARCHAR(100) NULL AFTER `graduationYear`;

ALTER TABLE `Job`
ADD COLUMN `short` TINYINT(1) NULL AFTER `hygienistPrivateNotes`,
ADD COLUMN `urgent` TINYINT(1) NULL AFTER `short`,
ADD COLUMN `weekend` TINYINT(1) NULL AFTER `urgent`;

ALTER TABLE `Hygienist`
ADD COLUMN `blockedUntil` DATETIME NULL AFTER `languages`;

ALTER TABLE `Hygienist`
ADD COLUMN `numBooked` INT(11) NULL AFTER `blockedUntil`,
ADD COLUMN `numCancelled` INT(11) NULL AFTER `numBooked`;

ALTER TABLE `Hygienist`
ADD COLUMN `lastCDHOCheck` DATETIME NULL AFTER `numCancelled`,
ADD COLUMN `enabled` TINYINT(1) NULL DEFAULT 1 AFTER `lastCDHOCheck`;

ALTER TABLE `Job`
ADD COLUMN `bonus` DECIMAL(4,2) NULL AFTER `weekend`;

ALTER TABLE `Job`
DROP COLUMN `modifiedOn`;

ALTER TABLE `Job` 
ADD COLUMN `modifiedOn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP after `bookedOn`;
