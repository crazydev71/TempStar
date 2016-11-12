ALTER TABLE `Hygienist`
ADD COLUMN `placements` VARCHAR(20) NULL AFTER `location`;

CREATE TABLE `SendResumeRequest` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `dentistId` int(11) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `maxResumes` tinyint(1) DEFAULT NULL,
    `resumesSent` tinyint(1) DEFAULT NULL,
    `sentOn` datetime DEFAULT NULL,
    PRIMARY KEY (`id`)
);
