ALTER TABLE `tempstars`.`PartialOffer`
ADD COLUMN `hourlyRate` DECIMAL(6,2) NULL AFTER `statusChangeOn`;
