-- MySQL dump 10.13  Distrib 5.6.19, for osx10.7 (i386)
--
-- Host: localhost    Database: tempstars
-- ------------------------------------------------------
-- Server version	5.6.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `BlockedDentist`
--

DROP TABLE IF EXISTS `BlockedDentist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BlockedDentist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hygienistId` int(11) NOT NULL,
  `blockedDentistId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`hygienistId`,`blockedDentistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BlockedHygienist`
--

DROP TABLE IF EXISTS `BlockedHygienist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BlockedHygienist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dentistId` int(11) NOT NULL,
  `blockedHygienistId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Dentist`
--

DROP TABLE IF EXISTS `Dentist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Dentist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `practiceName` varchar(100) NOT NULL,
  `businessOwner` varchar(100) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(30) NOT NULL,
  `postalCode` varchar(7) NOT NULL,
  `lat` float NOT NULL,
  `lon` float NOT NULL,
  `regionId` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `website` varchar(100) NOT NULL,
  `rating` float NOT NULL,
  `billingStatus` int(11) NOT NULL COMMENT 'current, pastdue',
  `authoUserId` varchar(100) DEFAULT NULL,
  `stripeCustomerId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth0userId_UNIQUE` (`authoUserId`),
  UNIQUE KEY `stripeCustomerId_UNIQUE` (`stripeCustomerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DentistDetail`
--

DROP TABLE IF EXISTS `DentistDetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DentistDetail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dentistId` int(11) NOT NULL,
  `primaryContact` varchar(100) NOT NULL,
  `parking` varchar(100) NOT NULL,
  `payment` varchar(100) NOT NULL,
  `hygienistArrival` varchar(100) NOT NULL,
  `radiography` varchar(100) NOT NULL,
  `ultrasonic` varchar(100) NOT NULL,
  `sterilization` varchar(100) NOT NULL,
  `avgRecallTime` varchar(100) NOT NULL,
  `recallReport` varchar(100) NOT NULL,
  `lunch` varchar(100) NOT NULL,
  `charting` varchar(100) NOT NULL,
  `officeSoftware` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dentistId_UNIQUE` (`dentistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DentistEvaluation`
--

DROP TABLE IF EXISTS `DentistEvaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DentistEvaluation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobId` int(11) NOT NULL,
  `overall` int(11) NOT NULL,
  `friendliness` int(11) NOT NULL,
  `cleanliness` int(11) NOT NULL,
  `organization` int(11) NOT NULL,
  `favourite` tinyint(1) NOT NULL,
  `block` tinyint(1) NOT NULL,
  `privateNotes` text NOT NULL,
  `publicComments` text NOT NULL,
  `createdOn` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobId_index` (`jobId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FavouriteDentist`
--

DROP TABLE IF EXISTS `FavouriteDentist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FavouriteDentist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hygienistId` int(11) NOT NULL,
  `favDentistId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hygienistId_favDentistId_index` (`hygienistId`,`favDentistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FavouriteHygienist`
--

DROP TABLE IF EXISTS `FavouriteHygienist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FavouriteHygienist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dentistId` int(11) NOT NULL,
  `favHygienistId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`dentistId`,`favHygienistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hygienist`
--

DROP TABLE IF EXISTS `Hygienist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hygienist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(30) NOT NULL,
  `postalCode` varchar(7) NOT NULL,
  `lat` float NOT NULL,
  `lon` float NOT NULL,
  `regionId` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `CDHONumber` varchar(20) NOT NULL,
  `starScore` float NOT NULL,
  `photoUrl` varchar(255) NOT NULL,
  `resumeUrl` varchar(255) NOT NULL,
  `showForHire` tinyint(1) NOT NULL,
  `lastJobIdViewed` int(11) NOT NULL,
  `auth0UserId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth0UserId_UNIQUE` (`auth0UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `HygienistEvaluation`
--

DROP TABLE IF EXISTS `HygienistEvaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `HygienistEvaluation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobId` int(11) DEFAULT NULL,
  `overall` int(11) NOT NULL,
  `puctuallity` int(11) NOT NULL,
  `presentation` int(11) NOT NULL,
  `clinicalSkill` int(11) NOT NULL,
  `connection` int(11) NOT NULL,
  `communication` int(11) NOT NULL,
  `favourite` tinyint(1) NOT NULL,
  `block` tinyint(1) NOT NULL,
  `privateNotes` text NOT NULL,
  `publicComments` text NOT NULL,
  `createdOn` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`jobId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Invoice`
--

DROP TABLE IF EXISTS `Invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Invoice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobId` int(11) NOT NULL,
  `manualHygienistId` int(11) NOT NULL,
  `totalHours` decimal(4,2) NOT NULL,
  `totalUnpaidHours` decimal(4,2) NOT NULL,
  `hourlyRate` int(11) NOT NULL,
  `totalInvoice` decimal(6,2) NOT NULL,
  `hygienistMarkedPaid` tinyint(1) NOT NULL,
  `dentistMarkedPaid` tinyint(1) NOT NULL,
  `sent` tinyint(1) NOT NULL,
  `createdOn` datetime NOT NULL,
  `sentOn` datetime NOT NULL,
  `paidOn` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`jobId`),
  KEY `index3` (`manualHygienistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Job`
--

DROP TABLE IF EXISTS `Job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dentistId` int(11) NOT NULL,
  `hygienistId` int(11) NOT NULL,
  `postedOn` datetime NOT NULL,
  `bookedOn` datetime NOT NULL,
  `completedOn` datetime NOT NULL,
  `hourlyRate` decimal(6,2) NOT NULL,
  `status` int(11) NOT NULL,
  `cascadeInterval` int(11) NOT NULL,
  `modifiedOn` datetime NOT NULL,
  `invoiceSent` tinyint(1) DEFAULT NULL,
  `dentistinvoicePaid` tinyint(1) DEFAULT NULL,
  `hygienistInvoicePaid` tinyint(1) DEFAULT NULL,
  `dentistEvalComplete` tinyint(1) DEFAULT NULL,
  `hygienistEvalComplete` tinyint(1) DEFAULT NULL,
  `dentistBilled` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`dentistId`),
  KEY `index3` (`hygienistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PartialOffer`
--

DROP TABLE IF EXISTS `PartialOffer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PartialOffer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobId` int(11) NOT NULL,
  `hygienistId` int(11) NOT NULL,
  `offeredStartTime` datetime NOT NULL,
  `offeredEndTime` datetime NOT NULL,
  `status` int(11) NOT NULL COMMENT 'offered, accepted, declined, canceled, changed',
  `createdOn` datetime DEFAULT NULL,
  `modifiedOn` datetime NOT NULL,
  `statusChangeOn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`jobId`),
  KEY `index3` (`hygienistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PostalCode`
--

DROP TABLE IF EXISTS `PostalCode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PostalCode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postalCode` varchar(7) NOT NULL,
  `regionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`regionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Region`
--

DROP TABLE IF EXISTS `Region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Region` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(50) NOT NULL,
  `rate` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Shift`
--

DROP TABLE IF EXISTS `Shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Shift` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jobId` int(11) NOT NULL,
  `postedStart` datetime NOT NULL,
  `postedEnd` datetime NOT NULL,
  `actualStart` datetime NOT NULL,
  `actualEnd` datetime NOT NULL,
  `unpaidHours` decimal(4,0) NOT NULL,
  `totalHours` decimal(4,0) NOT NULL,
  `modifiedOn` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index2` (`jobId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-08-07 21:25:41
