-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 27, 2025 at 01:01 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sysdevdb2`
--

-- --------------------------------------------------------

--
-- Table structure for table `bill`
--

CREATE TABLE `bill` (
  `bill_id` int(11) NOT NULL,
  `issued_date` date NOT NULL,
  `bill_inv_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `cus_id` smallint(11) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `cus_phone_number` varchar(12) NOT NULL,
  `cus_fname` varchar(20) NOT NULL,
  `cus_lname` varchar(20) NOT NULL,
  `cus_address1` varchar(110) NOT NULL,
  `cus_address2` varchar(60) NOT NULL,
  `cus_delete_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`cus_id`, `nic`, `cus_phone_number`, `cus_fname`, `cus_lname`, `cus_address1`, `cus_address2`, `cus_delete_status`) VALUES
(6, '159357246V', '0770000006', 'Olivia', 'Willia', '369 Walnut Blvd', 'Suite 601', 0),
(8, '369258147V', '0770000008', 'Emma', 'Garcia', '147 Spruce Blvd', 'Apt 801', 0),
(9, '258369147V', '0770000009', 'Alexand', 'Martinez', '258 Oakwood Ave', 'Room 901', 0),
(10, '147258369V', '0777593701', 'Sophiiiii', 'Hernandez', '369 Maple St', 'Unit C', 1),
(12, '123789456V', '0770000012', 'Avaaaa', 'Gonzalez', '789 Pine Dra', 'Floor 12', 0),
(13, '456789123V', '0770000013', 'Noah', 'Wilson', '123 Cedar Blvd', 'Apt 1301', 0),
(14, '987123456V', '0770000014', 'Isabella', 'Anderson', '456 Spruce Dr', 'Room 1401', 0),
(15, '321654987V', '0770000015', 'Lucas', 'Thomas', '789 Oakwood Blvd', 'Unit D', 0),
(16, '852741963V', '0770000016', 'Mia', 'Taylor', '159 Maple Ave', 'Suite 1501', 0),
(17, '369147258V', '0770000017', 'Mason', 'Jackson', '369 Walnut St', 'Floor 16', 0),
(18, '654258369V', '0770000018', 'Harper', 'White', '741 Pine Ave', 'Apt 1701', 0),
(19, '789123456V', '0770000019', 'Ethan', 'Harris', '852 Cedar Blvd', 'Room 1801', 0),
(20, '123456789V', '0770000020', 'Evelyn', 'Martin', '963 Spruce Dr', 'Unit E', 0),
(21, '987654321V', '0770000021', 'Logan', 'Thompson', '147 Oakwood Blvd', 'Suite 1901', 0),
(22, '456123789V', '0770000022', 'Avery', 'Robinson', '258 Cedar St', 'Floor 20', 0),
(23, '654987321V', '0770000023', 'Liam', 'Wood', '369 Elm Ave', 'Apt 2101', 0),
(24, '789456123V', '0770000024', 'Charlotte', 'Lewis', '741 Maple Blvd', 'Room 2201', 0),
(25, '159357246V', '0770000025', 'Carter', 'Lee', '852 Pine Dr', 'Unit F', 0),
(26, '753951852V', '0770000026', 'Amelia', 'Walker', '963 Cedar Blvd', 'Suite 2301', 0),
(27, '369258147V', '0770000027', 'Daniel', 'Hall', '123 Oak St', 'Floor 24', 0),
(28, '258369147V', '0770000028', 'Aria', 'Allen', '369 Walnut Blvd', 'Apt 2501', 0),
(29, '147258369V', '0770000029', 'Matthew', 'Young', '741 Spruce St', 'Room 2601', 0),
(30, '789654321V', '0770000030', 'Luna', 'King', '852 Maple Ave', 'Unit G', 0),
(31, '123789456V', '0770000031', 'Michael', 'Wright', '963 Oakwood Blvd', 'Suite 2701', 0),
(32, '456789123V', '0770000032', 'Sofia', 'Scott', '147 Cedar Dr', 'Floor 28', 0),
(33, '987123456V', '0770000033', 'William', 'Green', '258 Pine Blvd', 'Apt 2901', 0),
(34, '321654987V', '0770000034', 'Chloe', 'Baker', '369 Elm St', 'Room 3001', 0),
(35, '852741963V', '0770000035', 'Alexander', 'Hill', '741 Maple Dr', 'Unit H', 0),
(36, '369147258V', '0770000036', 'Harper', 'Evans', '852 Cedar Blvd', 'Suite 3101', 0),
(37, '654258369V', '0770000037', 'Oliver', 'Adams', '963 Spruce Ave', 'Floor 32', 0),
(38, '789123456V', '0770000038', 'Ava', 'Campbell', '123 Oakwood Blvd', 'Apt 3301', 0),
(39, '123456789V', '0770000039', 'Emma', 'Parker', '147 Cedar St', 'Room 3401', 0),
(41, '456123789V', '0770000041', 'Aiden', 'Cooper', '369 Elm Ave', 'Suite 3501', 0),
(42, '654987321V', '0770000042', 'Charlotte', 'Collins', '741 Pine St', 'Floor 36', 0),
(43, '789456123V', '0770000043', 'Avery', 'Hunt', '852 Maple Blvd', 'Apt 3701', 0),
(44, '159357246V', '0770000044', 'Elijah', 'Roberts', '963 Oakwood Dr', 'Room 3801', 0),
(45, '753951852V', '0770000045', 'Amelia', 'Cook', '123 Cedar Blvd', 'Unit J', 0),
(46, '369258147V', '0770000046', 'Mia', 'Stewart', '147 Walnut St', 'Suite 3901', 0),
(47, '258369147V', '0770000047', 'Benjamin', 'Miller', '258 Elm Blvd', 'Floor 40', 0),
(48, '147258369V', '0770000048', 'Ethan', 'Martin', '369 Pine Ave', 'Apt 4101', 0),
(49, '789654321V', '0770000049', 'Evelyn', 'Turner', '741 Cedar Blvd', 'Room 4201', 0),
(50, '123789456V', '0770000050', 'Liam', 'Ward', '852 Spruce Ave', 'Unit K', 0),
(51, '456789123V', '0770000051', 'Aria', 'Perez', '963 Oak Ln', 'Suite 4301', 0),
(52, '987123456V', '0770000052', 'Mason', 'Hernandez', '123 Maple Dr', 'Floor 44', 0),
(53, '321654987V', '0770000053', 'Melwil', 'Susa', 'melwil road', 'Apt 4501', 0),
(54, '852741963V', '0770000054', 'Harper', 'Young', '258 Elm St', 'Room 4601', 0),
(55, '369147258V', '0770000055', 'William', 'Gonzalez', '369 Pine Blvd', 'Unit L', 0),
(56, '654258369V', '0770000056', 'Olivia', 'Gomez', '741 Cedar Dr', 'Suite 4701', 0),
(57, '789123456V', '0770000057', 'Mia', 'Perry', '852 Spruce Blvd', 'Floor 48', 0),
(58, '123456789V', '0770000058', 'Alexander', 'Butler', '963 Oak St', 'Apt 4901', 0),
(59, '987654321V', '0770000059', 'Charlotte', 'Woods', '123 Maple Ave', 'Room 5001', 0),
(60, '456123789V', '0770000060', 'Logan', 'Barnes', '147 Walnut Ln', 'Unit M', 0),
(61, '654987321V', '0770000061', 'James', 'Coleman', '258 Elm Blvd', 'Suite 5101', 0),
(62, '789456123V', '0770000062', 'Emma', 'Rodriguez', '369 Pine St', 'Floor 52', 0),
(63, '159357246V', '0770000063', 'Oliver', 'Evans', '741 Cedar Ave', 'Apt 5301', 0),
(64, '753951852V', '0770000064', 'Ava', 'Fisher', '852 Spruce Ln', 'Room 5401', 0),
(65, '369258147V', '0770000065', 'Ethan', 'Stevens', '963 Oakwood Dr', 'Unit N', 0),
(66, '258369147V', '0770000066', 'Sophia', 'Ford', '123 Cedar St', 'Suite 5501', 0),
(67, '147258369V', '0770000067', 'Jackson', 'Harrison', '147 Walnut Blvd', 'Floor 56', 0),
(68, '789654321V', '0770000068', 'Avery', 'Murray', '258 Elm Ave', 'Apt 5701', 0),
(69, '123789456V', '0770000069', 'Liam', 'Washington', '369 Pine Dr', 'Room 5801', 0),
(70, '456789123V', '0770000070', 'Isabella', 'Jenkins', '741 Cedar Blvd', 'Unit O', 0),
(71, '987123456V', '0770000071', 'Aria', 'Pierce', '852 Spruce St', 'Suite 5901', 0),
(72, '321654987V', '0770000072', 'Mason', 'Lawrence', '963 Oak Ln', 'Floor 60', 0),
(73, '852741963V', '0770000073', 'Ella', 'Cole', '123 Cedar Blvd', 'Apt 6101', 0),
(74, '369147258V', '0770000074', 'William', 'West', '147 Walnut Blvd', 'Room 6201', 0),
(75, '654258369V', '0770000075', 'Harper', 'Hayes', '258 Elm St', 'Unit P', 0),
(76, '789123456V', '0770000076', 'Olivia', 'Gordon', '369 Pine Ave', 'Suite 6301', 0),
(77, '123456789V', '0770000077', 'Michael', 'Lane', '741 Cedar Blvd', 'Floor 64', 0),
(78, '987654321V', '0770000078', 'Emma', 'Simpson', '852 Spruce Dr', 'Apt 6501', 0),
(82, '159357246V', '0770000082', 'Jackson', 'Perkins', '258 Elm Blvd', 'Floor 68', 0),
(84, '369258147V', '0770000084', 'Liam', 'Spencer', '741 Cedar Ln', 'Room 7001', 0),
(85, '258369147V', '0770000085', 'Aria', 'Grant', '852 Spruce Blvd', 'Unit R', 0),
(86, '147258369V', '0770000086', 'Mason', 'Casey', '963 Oak St', 'Suite 7101', 0),
(87, '789654321V', '0770000087', 'Ella', 'Knights', '123 Cedar Blvd', 'Floor 72', 0),
(88, '123789456V', '0770000088', 'William', 'Barrett', '147 Walnut Blvd', 'Apt 7301', 0),
(89, '456789123V', '0770000089', 'Harper', 'Payne', '258 Elm Ave', 'Room 7401', 0),
(90, '987123456V', '0770000090', 'Olivia', 'Fletcher', '369 Pine St', 'Unit S', 0),
(91, '321654987V', '0770000091', 'Michael', 'Gill', '741 Cedar Dr', 'Suite 7501', 0),
(92, '852741963V', '0770000092', 'Emma', 'Rowe', '852 Spruce Blvd', 'Floor 76', 0),
(93, '369147258V', '0770000093', 'Oliver', 'Hampton', '963 Oakwood Ave', 'Apt 7701', 0),
(94, '654258369V', '0770000094', 'Ava', 'Conner', '123 Cedar Blvd', 'Room 7801', 0),
(95, '789123456V', '0770000095', 'Sophia', 'Black', '147 Walnut St', 'Unit T', 0),
(96, '123456789V', '0770000096', 'Jackson', 'Cameron', '258 Elm Blvd', 'Suite 7901', 0),
(97, '987654321V', '0770000097', 'Isabella', 'Lambert', '369 Pine Ave', 'Floor 80', 0),
(98, '456123789V', '0770000098', 'Liam', 'Adkins', '741 Cedar Blvd', 'Apt 8101', 0),
(99, '654987321V', '0770000099', 'Aria', 'Keller', '852 Spruce Dr', 'Room 8201', 0),
(100, '789456123V', '0770000100', 'Mason', 'Bridges', '963 Oakwood Blvd', 'Unit U', 0),
(102, 'Theekshana', 'Fernando', '200031702568', '0718976568', '52/16 P.M Fernando', '5th lane,Moratuwa', 1),
(117, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(118, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(119, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(120, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(121, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(122, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(123, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(124, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(125, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(126, '147258369V', '0770000010', 'Sophia', 'Hernandez', '369 Maple St', 'Unit C', 0),
(127, '123456789v', '0123456789', 'John', 'Doe', '123 Main St', 'Apt 4', 0),
(169, '200031702568', '0782367100', 'Theekshana', 'Fernando', '16/52', 'P.M Fernando 5th lane', 0),
(170, '200031702568', '0718976568', 'theekshana', 'fernando', '16/52', 'P.M Fernando 5th lane', 1),
(171, '200031702568', '0718976568', 'theekshana', 'fernandop', 'asdasdsd', 'dasdsad', 0),
(172, '200031702568', '0718976568', 'theekshana', 'fernandop', 'asdasdsd', 'dasdsad', 0),
(173, '200031702568', '0718976568', 'theekshana', 'fernandop', 'asdasdsd', 'dasdsad', 0),
(174, '123456789012', '0718976568', 'kamal', 'perera', '52-2a', 'colombo', 0),
(175, '200031702568', '0718976568', 'Theekshana', 'Fernando', '16/52 P.M Fern', 'Moratuwa', 1),
(176, '200031702568', '0718976568', 'theekshana', 'fernando', 'asdwad', 'awda', 0),
(177, '123456789v', '718976568', 'theekshana', 'fernando', 'kelaniya', 'kelaniya', 1),
(178, '200031702568', '0718976568', 'pinimal', 'fernando', 'moratuwa', 'moratuwa', 0),
(179, '200031702568', '0718976568', 'dddd', 'Fernando', '16/52 P.M Fernando 5th Lane', 'Moratuwa', 1),
(180, '892691207v', '0772454557', 'Wasantha ', 'Kumara', '367 Clovis mawatha, Moratuwella', 'Moratuwa', 0),
(181, '995850290v', '0774581674', 'Umesha', 'Silva', '68-A M.J.C Fernando Mw, Idama', 'Moratuwa', 0),
(182, '200134233445', '0771456437', 'zafry', 'perera', 'matale', 'kandy road', 0);

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `eq_id` int(11) NOT NULL,
  `eq_name` varchar(30) NOT NULL,
  `eq_rental` decimal(10,2) NOT NULL,
  `eq_description` varchar(255) DEFAULT NULL,
  `eq_dofpurchase` date DEFAULT NULL,
  `eq_warranty_expire` date DEFAULT NULL,
  `eq_cost` decimal(10,2) DEFAULT NULL,
  `eq_defected_status` int(1) NOT NULL DEFAULT 0,
  `eq_completestock` int(3) NOT NULL DEFAULT 1,
  `eq_delete_status` tinyint(1) NOT NULL DEFAULT 0,
  `eq_catid` smallint(6) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`eq_id`, `eq_name`, `eq_rental`, `eq_description`, `eq_dofpurchase`, `eq_warranty_expire`, `eq_cost`, `eq_defected_status`, `eq_completestock`, `eq_delete_status`, `eq_catid`) VALUES
(1, 'ඩ්‍රිල්-1', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(2, 'ඩ්‍රිල්-2', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(3, 'ඩ්‍රිල්-3', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(4, 'ඩ්‍රිල්-4', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(5, 'ඩ්‍රිල්-5', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(6, 'හිල්ටි-1', 500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(7, 'හිල්ටි-2', 500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(8, 'හිල්ටි-3', 500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(9, 'හිල්ටි-4', 500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(10, 'බැටරි ඩ්‍රිල්-1', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(11, 'බැටරි ඩ්‍රිල්-2', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(12, 'බැටරි ඩ්‍රිල්-3', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(13, 'බැටරි ඩ්‍රිල්-4', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(14, 'ග්‍රයින්ඩර් (4.5)-1', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(15, 'ග්‍රයින්ඩර් (4.5)-2', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(16, 'ග්‍රයින්ඩර් (4.5)-3', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(17, 'ග්‍රයින්ඩර් (4.5)-4', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(18, 'ග්‍රයින්ඩර් (4)-1', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(19, 'ග්‍රයින්ඩර් (4)-2', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(20, 'ග්‍රයින්ඩර් (4)-3', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(21, 'ග්‍රයින්ඩර් (7)-1', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(22, 'ග්‍රයින්ඩර් (7)-2', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(23, 'ග්‍රයින්ඩර් (7)-3', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(24, 'බ්‍රේකර් (ලොකු)-1', 3500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(25, 'බ්‍රේකර් (ලොකු)-2', 3500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(26, 'බ්‍රේකර් (ලොකු)-3', 3500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(27, 'බ්‍රේකර් (ලොකු)-4', 3500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(28, 'බ්‍රේකර් (පොඩි)-1', 2000.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(29, 'බ්‍රේකර් (පොඩි)-2', 2000.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(30, 'බ්ලොවර්-1', 250.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(31, 'ෆ්ලැට් සෑන්ඩර්-1', 300.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(32, 'ෆ්ලැට් සෑන්ඩර්-2', 300.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(33, 'ජිග් සෝ-1', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(34, 'ජිග් සෝ-2', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(35, 'ජිග් සෝ-3', 400.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(36, 'සර්කියුලර් සෝ-1', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(37, 'සර්කියුලර් සෝ-2', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(38, 'සර්කියුලර් සෝ-3', 600.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(39, 'චේන් සෝ-1', 1500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(40, 'මයිට(ර්) සෝ (පොඩි)-1', 1000.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(41, 'මයිට(ර්) සෝ (පොඩි)-2', 1000.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(42, 'මයිට(ර්) සෝ (ලොකු) -1', 1500.00, NULL, NULL, NULL, NULL, 0, 1, 0, 1),
(56, 'scaffoldings', 80.00, 'simple', '2025-03-11', '2025-03-01', 2000.00, 4, 100, 0, 2),
(57, 'G I Pipe 20\'\'', 50.00, 'des', NULL, NULL, 2000.00, 2, 60, 0, 3),
(58, 'ඩ්‍රිල්-1', 250.00, 'simple', '2025-08-04', '2025-08-13', 3500.00, 0, 3, 1, 2),
(59, 'ඩ්‍රිල්-6', 200.00, '', NULL, NULL, 17500.00, 0, 1, 0, 1),
(60, 'battery drill', 250.00, '', NULL, NULL, 12500.00, 0, 1, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `equipmentcategory`
--

CREATE TABLE `equipmentcategory` (
  `eqcat_id` smallint(6) NOT NULL,
  `eqcat_name` varchar(20) NOT NULL,
  `eqcat_description` varchar(50) NOT NULL,
  `eqcat_dateset` smallint(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipmentcategory`
--

INSERT INTO `equipmentcategory` (`eqcat_id`, `eqcat_name`, `eqcat_description`, `eqcat_dateset`) VALUES
(1, '1 Day machines', '1 Day set', 1),
(2, '5 Days machines', '5 Days set', 5),
(3, '4 Days machines', '4 day set equipmetn', 4);

-- --------------------------------------------------------

--
-- Table structure for table `equipment_description`
--

CREATE TABLE `equipment_description` (
  `eq_des_id` int(11) NOT NULL,
  `eq_attribute` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `inv_id` int(11) NOT NULL,
  `inv_advance` int(10) NOT NULL,
  `inv_discount` int(11) DEFAULT 0,
  `inv_special_message` varchar(255) DEFAULT NULL,
  `inv_idcardstatus` tinyint(1) NOT NULL,
  `inv_cusid` smallint(6) DEFAULT NULL,
  `inv_createddate` datetime NOT NULL DEFAULT current_timestamp(),
  `inv_updatedstatus` tinyint(1) NOT NULL DEFAULT 0,
  `inv_delete_status` tinyint(1) NOT NULL DEFAULT 0,
  `inv_rating` tinyint(4) DEFAULT 0,
  `inv_completed_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`inv_id`, `inv_advance`, `inv_discount`, `inv_special_message`, `inv_idcardstatus`, `inv_cusid`, `inv_createddate`, `inv_updatedstatus`, `inv_delete_status`, `inv_rating`, `inv_completed_datetime`) VALUES
(1, 0, NULL, NULL, 1, 20, '2024-10-12 18:18:20', 1, 0, NULL, '2024-11-13 15:06:01'),
(56, 0, 0, NULL, 1, 31, '2024-10-12 20:46:23', 1, 0, NULL, NULL),
(57, 0, 4500, NULL, 1, 24, '2024-10-13 13:07:19', 1, 0, NULL, NULL),
(58, 0, NULL, NULL, 1, 34, '2024-10-13 15:21:31', 1, 0, NULL, NULL),
(59, 0, NULL, NULL, 1, 34, '2024-10-13 15:36:07', 1, 0, NULL, NULL),
(60, 0, 0, NULL, 1, 180, '2024-10-27 12:34:24', 1, 0, NULL, NULL),
(61, 0, NULL, NULL, 0, 23, '2024-11-13 21:28:29', 1, 0, NULL, NULL),
(62, 0, NULL, NULL, 0, 169, '2024-11-21 15:04:06', 1, 0, NULL, NULL),
(63, 0, NULL, NULL, 1, 171, '2024-12-13 11:26:48', 1, 0, NULL, NULL),
(64, 0, NULL, NULL, 1, 171, '2024-12-13 11:39:56', 1, 0, NULL, NULL),
(65, 0, NULL, NULL, 1, 171, '2024-12-13 11:54:59', 1, 0, NULL, NULL),
(66, 0, NULL, NULL, 0, 171, '2024-12-13 12:32:42', 1, 0, NULL, NULL),
(67, 0, NULL, NULL, 0, 171, '2024-12-13 12:48:35', 1, 0, NULL, NULL),
(68, 1000, 0, NULL, 1, 171, '2025-01-16 11:41:01', 1, 0, NULL, NULL),
(69, 5600, 0, NULL, 1, 171, '2025-01-16 12:11:23', 1, 0, NULL, NULL),
(70, 1222, 0, '', 1, 171, '2025-01-16 15:10:49', 1, 0, 0, NULL),
(71, 3000, 0, NULL, 1, 171, '2025-01-22 11:56:54', 1, 0, NULL, NULL),
(72, 1000, 0, NULL, 1, 171, '2025-01-22 12:54:18', 1, 0, NULL, NULL),
(73, 1000, NULL, NULL, 1, 171, '2025-01-09 16:19:22', 1, 0, NULL, NULL),
(74, 2000, 0, NULL, 0, 171, '2025-01-22 16:46:33', 1, 0, NULL, NULL),
(75, 6000, 0, NULL, 0, 171, '2025-01-24 13:14:01', 1, 0, NULL, '2025-02-08 19:49:59'),
(76, 2000, 0, NULL, 1, 171, '2025-01-26 10:58:51', 1, 0, NULL, '2025-01-27 12:41:46'),
(77, 35555, 0, NULL, 0, 171, '2025-01-27 11:24:06', 1, 0, NULL, '2025-01-27 12:37:21'),
(78, 2000, 0, NULL, 1, 171, '2025-02-08 19:48:33', 1, 0, NULL, '2025-02-08 19:49:26'),
(79, 0, NULL, NULL, 1, 174, '2025-03-15 14:54:45', 1, 0, NULL, NULL),
(80, 2000, NULL, NULL, 1, 174, '2025-03-05 15:03:23', 1, 0, NULL, NULL),
(81, 1000, 0, NULL, 1, 171, '2025-08-25 00:33:00', 1, 0, NULL, '2025-08-26 01:32:11'),
(82, 1000, 0, NULL, 0, 171, '2025-08-25 00:34:35', 1, 0, NULL, NULL),
(83, 2000, 0, NULL, 1, 171, '2025-08-25 00:53:22', 1, 0, NULL, NULL),
(84, 2000, 0, NULL, 1, 171, '2025-08-25 04:20:24', 1, 0, NULL, '2025-08-25 04:22:18'),
(85, 200, 600, NULL, 0, 8, '2025-08-25 04:24:36', 1, 0, NULL, '2025-08-26 13:33:08'),
(86, 2000, 0, NULL, 1, 181, '2025-08-25 16:52:44', 1, 0, NULL, '2025-08-26 13:03:06'),
(87, 6000, 0, NULL, 1, 19, '2025-08-25 17:05:58', 1, 0, NULL, NULL),
(88, 1000, 0, NULL, 0, 34, '2025-08-25 21:05:00', 1, 0, NULL, NULL),
(89, 200, 100, NULL, 1, 32, '2025-08-26 13:41:14', 1, 0, NULL, NULL),
(90, 0, 0, '', 0, NULL, '2025-08-26 13:41:23', 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoiceequipment`
--

CREATE TABLE `invoiceequipment` (
  `inveq_id` int(11) NOT NULL,
  `inveq_invid` int(11) NOT NULL,
  `inveq_eqid` int(11) NOT NULL,
  `inveq_borrow_date` datetime NOT NULL,
  `inveq_return_date` datetime DEFAULT NULL,
  `duration_in_days` smallint(6) DEFAULT 0,
  `inveq_borrowqty` int(5) NOT NULL DEFAULT 1,
  `inveq_returned_quantity` smallint(6) DEFAULT 0,
  `inveq_updated_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoiceequipment`
--

INSERT INTO `invoiceequipment` (`inveq_id`, `inveq_invid`, `inveq_eqid`, `inveq_borrow_date`, `inveq_return_date`, `duration_in_days`, `inveq_borrowqty`, `inveq_returned_quantity`, `inveq_updated_status`) VALUES
(91, 73, 56, '2025-01-15 16:18:56', NULL, 0, 9, 0, 0),
(92, 73, 28, '2025-01-15 16:19:08', '2025-01-22 16:31:51', 0, 1, 1, 1),
(93, 73, 24, '2025-01-15 16:19:13', NULL, 0, 1, 0, 0),
(95, 73, 56, '2025-01-15 16:18:56', '2025-01-22 16:26:05', 7, 1, 1, 1),
(96, 74, 12, '2025-01-22 16:46:13', '2025-01-22 16:46:44', 0, 1, 1, 1),
(97, 74, 20, '2025-01-22 16:46:19', '2025-01-24 13:07:54', 0, 1, 1, 1),
(98, 74, 56, '2025-01-22 16:46:27', '2025-01-24 13:13:28', 0, 11, 11, 1),
(99, 74, 56, '2025-01-22 16:46:27', '2025-01-22 16:46:54', 27, 1, 1, 1),
(100, 75, 56, '2025-01-24 13:13:41', NULL, 0, 33, 0, 0),
(101, 75, 32, '2025-01-24 13:13:46', '2025-01-24 13:14:25', 0, 1, 1, 1),
(102, 75, 27, '2025-01-24 13:13:51', '2025-01-24 13:15:00', 0, 1, 1, 1),
(103, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:14:13', 32, 10, 10, 1),
(104, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:14:35', 54, 1, 1, 1),
(105, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:14:47', 106, 2, 2, 1),
(106, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:15:07', 126, 1, 1, 1),
(107, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:29:34', 1553, 1, 1, 1),
(108, 75, 56, '2025-01-24 13:13:41', '2025-01-24 13:29:43', 1602, 2, 2, 1),
(109, 76, 56, '2025-01-26 10:58:44', '2025-01-26 11:17:49', 0, 20, 20, 1),
(110, 76, 56, '2025-01-22 10:00:00', '2025-01-28 15:30:00', 7, 10, 10, 1),
(111, 77, 56, '2025-01-27 11:23:53', NULL, 0, 8, 0, 0),
(112, 77, 23, '2025-01-16 11:24:00', '2025-01-27 11:53:48', 12, 1, 1, 1),
(113, 77, 56, '2025-01-20 11:23:53', '2025-01-27 11:24:19', 8, 10, 10, 1),
(114, 77, 56, '2025-01-27 11:23:53', '2025-01-27 12:30:54', 1, 2, 2, 1),
(115, 78, 26, '2025-02-08 19:48:15', '2025-02-08 19:48:45', 1, 1, 1, 1),
(116, 78, 22, '2025-02-08 19:48:19', '2025-02-08 19:49:06', 1, 1, 1, 1),
(117, 79, 56, '2025-03-15 14:54:29', NULL, 0, 11, 0, 0),
(118, 79, 56, '2025-03-15 14:54:29', NULL, 0, 1, 1, 1),
(119, 80, 56, '2025-03-15 15:03:16', NULL, 0, 3, 0, 0),
(120, 80, 56, '2025-03-05 15:03:16', '2025-03-10 08:38:37', 5, 5, 5, 1),
(121, 80, 56, '2025-03-05 15:03:16', '2025-03-11 10:00:25', 6, 2, 2, 1),
(122, 73, 56, '2025-01-15 16:18:56', NULL, 0, 1, 1, 1),
(123, 81, 56, '2025-08-25 00:32:36', '2025-08-25 00:34:08', 1, 1, 1, 1),
(124, 81, 24, '2025-08-25 00:32:51', '2025-08-25 00:33:41', 1, 1, 1, 1),
(125, 81, 56, '2025-08-25 00:32:36', '2025-08-25 00:33:16', 1, 2, 2, 1),
(126, 81, 56, '2025-08-25 00:32:36', '2025-08-25 00:33:32', 1, 1, 1, 1),
(127, 81, 56, '2025-08-25 00:32:36', '2025-08-25 00:33:56', 1, 8, 8, 1),
(128, 82, 56, '2025-08-25 00:34:29', NULL, 0, 2, 0, 0),
(129, 82, 22, '2025-08-25 00:34:34', '2025-08-25 00:34:41', 1, 1, 1, 1),
(130, 82, 56, '2025-08-25 00:34:29', '2025-08-25 00:34:50', 1, 3, 3, 1),
(131, 82, 56, '2025-08-25 00:34:29', '2025-08-25 00:37:58', 1, 5, 5, 1),
(132, 82, 56, '2025-08-25 00:34:29', '2025-08-25 00:50:57', 1, 2, 2, 1),
(133, 83, 57, '2025-08-25 00:52:54', '2025-08-26 01:37:29', 2, 5, 5, 1),
(134, 83, 56, '2025-08-25 00:52:58', '2025-08-26 01:37:20', 2, 5, 5, 1),
(135, 83, 57, '2025-08-25 00:52:54', '2025-08-25 00:53:57', 1, 20, 20, 1),
(136, 83, 56, '2025-08-25 00:52:58', '2025-08-25 01:56:38', 1, 20, 20, 1),
(137, 84, 59, '2025-08-25 04:20:23', '2025-08-25 04:22:13', 1, 1, 1, 1),
(138, 85, 57, '2025-08-25 04:24:33', '2025-08-25 04:25:21', 1, 10, 10, 1),
(139, 86, 56, '2025-08-25 16:52:02', '2025-08-25 16:58:14', 1, 1, 1, 1),
(140, 86, 23, '2025-08-25 16:52:17', '2025-08-25 16:57:57', 1, 1, 1, 1),
(141, 86, 56, '2025-08-25 16:52:02', '2025-08-25 16:53:55', 1, 19, 19, 1),
(142, 87, 14, '2025-08-25 17:05:52', '2025-08-25 17:07:03', 1, 1, 1, 1),
(143, 88, 57, '2025-08-25 21:04:53', '2025-08-26 03:12:24', 1, 15, 15, 1),
(144, 88, 57, '2025-08-25 21:04:53', '2025-08-25 21:06:17', 1, 5, 5, 1),
(145, 89, 56, '2025-08-26 13:40:53', '2025-08-26 13:42:12', 1, 20, 20, 1),
(146, 89, 57, '2025-08-26 13:41:04', NULL, 0, 20, 0, 0);

--
-- Triggers `invoiceequipment`
--
DELIMITER $$
CREATE TRIGGER `trg_calculate_duration_in_days` BEFORE INSERT ON `invoiceequipment` FOR EACH ROW BEGIN
    IF NEW.inveq_return_date IS NOT NULL AND NEW.inveq_borrow_date IS NOT NULL THEN
        SET NEW.duration_in_days = CEIL(TIMESTAMPDIFF(SECOND, NEW.inveq_borrow_date, NEW.inveq_return_date) / 86400);
    ELSE
        SET NEW.duration_in_days = 0; -- Default value if either date is NULL
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_duration_in_days` BEFORE UPDATE ON `invoiceequipment` FOR EACH ROW BEGIN
    IF NEW.inveq_return_date IS NOT NULL AND NEW.inveq_borrow_date IS NOT NULL THEN
        SET NEW.duration_in_days = CEIL(TIMESTAMPDIFF(SECOND, NEW.inveq_borrow_date, NEW.inveq_return_date) / 86400);
    ELSE
        SET NEW.duration_in_days = 0;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `invoicepayments`
--

CREATE TABLE `invoicepayments` (
  `invpay_payment_id` varchar(30) NOT NULL,
  `invpay_inv_id` int(10) NOT NULL,
  `invpay_payment_date` datetime NOT NULL,
  `invpay_amount` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoicepayments`
--

INSERT INTO `invoicepayments` (`invpay_payment_id`, `invpay_inv_id`, `invpay_payment_date`, `invpay_amount`) VALUES
('5610126502000001a4', 56, '2024-09-27 00:00:00', 2000),
('561012913480000a7f', 56, '2024-10-09 00:00:00', 4800),
('5610270402000000240', 56, '2024-10-26 00:00:00', 20000),
('5710130454000000d19', 57, '2024-10-09 00:00:00', 40000),
('5710131521500000058', 57, '2024-10-10 00:00:00', 15000),
('591113978400000996', 59, '2024-11-10 00:00:00', 4000),
('60102710430000c34', 60, '2024-10-26 00:00:00', 300),
('68011688230000e52', 68, '2025-01-16 00:00:00', 300),
('69011602420000419', 69, '2025-01-15 00:00:00', 200),
('69011618957700cff', 69, '2025-01-14 00:00:00', 577),
('69011689120000db4', 69, '2025-01-16 00:00:00', 200),
('690116892500009cc', 69, '2025-01-12 00:00:00', 500),
('70011667723300282', 70, '2025-01-16 15:10:48', 233),
('7101225485000041a', 71, '2025-01-22 14:08:51', 500),
('71012256320000051b', 71, '2025-01-22 14:09:01', 2000),
('7101229745000041b', 71, '2025-01-22 13:39:45', 500),
('72012273720000b9b', 72, '2025-01-22 12:55:31', 200),
('73062418620000e81', 73, '2025-06-24 00:00:00', 200),
('73062476750000218', 73, '2025-06-24 00:00:00', 500),
('75012436850000250', 75, '2025-01-24 13:42:53', 500),
('760127003244002c1', 76, '2025-01-27 12:41:05', 244),
('790315473100000dc0', 79, '2025-03-15 00:00:00', 1000),
('800315030100000c92', 80, '2025-03-15 00:00:00', 1000),
('80031521750000f24', 80, '2025-03-14 00:00:00', 500),
('82082594320000b31', 82, '2025-08-25 00:37:44', 200),
('83082581520000e87', 83, '2025-08-25 01:02:15', 200),
('8608254625000078d', 86, '2025-08-25 16:54:02', 500),
('87082579650000e87', 87, '2025-08-25 17:08:16', 500),
('8808267431000003a9', 88, '2025-08-26 03:12:12', 1000),
('890826100100000caa', 89, '2025-08-26 13:44:37', 1000);

-- --------------------------------------------------------

--
-- Table structure for table `specialequipment`
--

CREATE TABLE `specialequipment` (
  `spe_id` int(11) NOT NULL,
  `spe_eqid` int(11) NOT NULL,
  `spe_eqcatid` smallint(11) NOT NULL,
  `spe_singleday_rent` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specialequipment`
--

INSERT INTO `specialequipment` (`spe_id`, `spe_eqid`, `spe_eqcatid`, `spe_singleday_rent`) VALUES
(1, 56, 2, 100),
(2, 57, 3, 100);

-- --------------------------------------------------------

--
-- Table structure for table `userrole`
--

CREATE TABLE `userrole` (
  `ur_roleid` tinyint(1) NOT NULL,
  `ur_role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userrole`
--

INSERT INTO `userrole` (`ur_roleid`, `ur_role`) VALUES
(1, 'admin'),
(2, 'cashier'),
(3, 'warehouse handler');

-- --------------------------------------------------------

--
-- Table structure for table `userrolemap`
--

CREATE TABLE `userrolemap` (
  `urm_id` tinyint(4) NOT NULL,
  `urm_userid` tinyint(4) NOT NULL,
  `urm_roleid` tinyint(4) NOT NULL,
  `urm_password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userrolemap`
--

INSERT INTO `userrolemap` (`urm_id`, `urm_userid`, `urm_roleid`, `urm_password`) VALUES
(67, 1, 1, '$2b$10$BrdAigb8dqXQSNT4x9wGP.OyVBNujHCN52cZn/LmGHB3duHgTCEMu'),
(81, 2, 2, '$2b$10$Tslyg1ZJAR1t6x/P4yGxsO1SRlMVjpoPTU40xIDOuI0jWvtL8M8ZK'),
(97, 24, 1, '$2b$10$aWxljbd7qzXFz4ExdYRe1eODZ0.O1vpp7Rnk11tWag5vrs/ou/TNG'),
(99, 24, 3, '$2b$10$aWxljbd7qzXFz4ExdYRe1eODZ0.O1vpp7Rnk11tWag5vrs/ou/TNG'),
(100, 24, 2, '$2b$10$uhK2gvQ5O0/12RPjCncf0uW.rpPkkbksGEze3TQZTT1as3aF3BH/G');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` tinyint(2) NOT NULL,
  `user_first_name` varchar(20) NOT NULL,
  `user_last_name` varchar(20) DEFAULT NULL,
  `username` varchar(15) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `user_phone_number` varchar(12) NOT NULL,
  `user_address1` varchar(30) NOT NULL,
  `user_address2` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_first_name`, `user_last_name`, `username`, `nic`, `user_phone_number`, `user_address1`, `user_address2`) VALUES
(1, 'Theekshana', 'fernando', 'theekshana', '200031702568', '0718976568', '52/16 p.m Fernando, 5th lane', 'moratuwa'),
(2, 'Achila', 'dilshan', 'achila', '2000130312', '0342425132', '23-A kiribathkumbura', 'kandy'),
(3, 'Shehan', 'chamudith', 'shehan', '2001334134', '0784524542', '23h-2 ', 'rathnapura'),
(24, 'Anupama ', 'Fernando', 'anux_', '200810184v', '0714609809', 'Moratuwalla', 'Moratuwa');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `bill-invoiceId fk` (`bill_inv_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`cus_id`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`eq_id`),
  ADD KEY `fk_equipment_catid` (`eq_catid`);

--
-- Indexes for table `equipmentcategory`
--
ALTER TABLE `equipmentcategory`
  ADD PRIMARY KEY (`eqcat_id`);

--
-- Indexes for table `equipment_description`
--
ALTER TABLE `equipment_description`
  ADD PRIMARY KEY (`eq_des_id`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`inv_id`),
  ADD KEY `fk_inv_cusid` (`inv_cusid`);

--
-- Indexes for table `invoiceequipment`
--
ALTER TABLE `invoiceequipment`
  ADD PRIMARY KEY (`inveq_id`),
  ADD KEY `inveq_invid` (`inveq_invid`),
  ADD KEY `inveq_eqid` (`inveq_eqid`);

--
-- Indexes for table `invoicepayments`
--
ALTER TABLE `invoicepayments`
  ADD PRIMARY KEY (`invpay_payment_id`),
  ADD KEY `fk_invoice_payment` (`invpay_inv_id`);

--
-- Indexes for table `specialequipment`
--
ALTER TABLE `specialequipment`
  ADD PRIMARY KEY (`spe_id`),
  ADD KEY `fk_spe_eqid` (`spe_eqid`),
  ADD KEY `fk_spe_eqcatid` (`spe_eqcatid`);

--
-- Indexes for table `userrole`
--
ALTER TABLE `userrole`
  ADD PRIMARY KEY (`ur_roleid`);

--
-- Indexes for table `userrolemap`
--
ALTER TABLE `userrolemap`
  ADD PRIMARY KEY (`urm_id`),
  ADD KEY `fk_userromemap_roleId` (`urm_roleid`),
  ADD KEY `fk_userromemap_userId` (`urm_userid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bill`
--
ALTER TABLE `bill`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `cus_id` smallint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `eq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `equipmentcategory`
--
ALTER TABLE `equipmentcategory`
  MODIFY `eqcat_id` smallint(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `inv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `invoiceequipment`
--
ALTER TABLE `invoiceequipment`
  MODIFY `inveq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `specialequipment`
--
ALTER TABLE `specialequipment`
  MODIFY `spe_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `userrole`
--
ALTER TABLE `userrole`
  MODIFY `ur_roleid` tinyint(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `userrolemap`
--
ALTER TABLE `userrolemap`
  MODIFY `urm_id` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` tinyint(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `bill-invoiceId fk` FOREIGN KEY (`bill_inv_id`) REFERENCES `invoice` (`inv_id`);

--
-- Constraints for table `equipment`
--
ALTER TABLE `equipment`
  ADD CONSTRAINT `fk_equipment_catid` FOREIGN KEY (`eq_catid`) REFERENCES `equipmentcategory` (`eqcat_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `fk_inv_cusid` FOREIGN KEY (`inv_cusid`) REFERENCES `customer` (`cus_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoiceequipment`
--
ALTER TABLE `invoiceequipment`
  ADD CONSTRAINT `invoiceequipment_ibfk_1` FOREIGN KEY (`inveq_invid`) REFERENCES `invoice` (`inv_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoiceequipment_ibfk_2` FOREIGN KEY (`inveq_eqid`) REFERENCES `equipment` (`eq_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoicepayments`
--
ALTER TABLE `invoicepayments`
  ADD CONSTRAINT `fk_invoice_payment` FOREIGN KEY (`invpay_inv_id`) REFERENCES `invoice` (`inv_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `specialequipment`
--
ALTER TABLE `specialequipment`
  ADD CONSTRAINT `fk_spe_eqcatid` FOREIGN KEY (`spe_eqcatid`) REFERENCES `equipmentcategory` (`eqcat_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_spe_eqid` FOREIGN KEY (`spe_eqid`) REFERENCES `equipment` (`eq_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userrolemap`
--
ALTER TABLE `userrolemap`
  ADD CONSTRAINT `fk_userromemap_roleId` FOREIGN KEY (`urm_roleid`) REFERENCES `userrole` (`ur_roleid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_userromemap_userId` FOREIGN KEY (`urm_userid`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
