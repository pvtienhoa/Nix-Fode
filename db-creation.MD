## database

> create database quickfix_test;
 
## tables

> use quickfix_test;

### livequotes

```
CREATE TABLE `Livequotes` (
  `ID` bigint(20) NOT NULL,
  `TimeStamp` bigint(20) DEFAULT NULL,
  `BrokerName` longtext CHARACTER SET utf8mb4,
  `Symbol` longtext CHARACTER SET utf8mb4,
  `Bid` double DEFAULT NULL,
  `Ask` double DEFAULT NULL,
  `Spread` double DEFAULT NULL,
  `SpreadAvg` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_LivequotesNY_TimeStamp` (`TimeStamp`),
  KEY `idx_LivequotesNY_Symbol` (`Symbol`(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### avg spreads

CREATE TABLE `AverageSpreads` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TimeStamp` bigint(20) DEFAULT NULL,
  `Duration` int(11) DEFAULT NULL,
  `BrokerName` longtext CHARACTER SET utf8mb4,
  `Symbol` longtext CHARACTER SET utf8mb4,
  `AvgSpread` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_AverageSpread_TimeStamp` (`TimeStamp`),
  KEY `idx_AverageSpread_Symbol` (`Symbol`(20))
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

### symbols

CREATE TABLE `Symbols` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `currencypairname` longtext CHARACTER SET utf8mb4,
  `requestId` longtext CHARACTER SET utf8mb4,
  `Digit` int(11) DEFAULT NULL,
  `LiveQuotes` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

