-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 17, 2026 at 02:34 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testwoyyy`
--

-- --------------------------------------------------------

--
-- Table structure for table `bankaccounts`
--

CREATE TABLE `bankaccounts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accountNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `holderName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bankaccounts`
--

INSERT INTO `bankaccounts` (`id`, `bankName`, `accountNumber`, `holderName`, `createdAt`, `updatedAt`) VALUES
('b1', 'BCA', '8820123456', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b17', 'Dana', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b18', 'GoPay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b19', 'ShopeePay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b2', 'BRI', '1234-01-000001-50-1', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b20', 'OVO', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b3', 'Mandiri', '133-00-1234567-8', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b4', 'BNI', '0123456789', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b8', 'BSI (Bank Syariah Indonesia)', '7001234567', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `cashflows`
--

CREATE TABLE `cashflows` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `referenceId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci,
  `defaultPriceType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `hpp` float DEFAULT '0',
  `priceRetail` float DEFAULT '0',
  `priceGeneral` float DEFAULT '0',
  `priceWholesale` float DEFAULT '0',
  `pricePromo` float DEFAULT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Pcs',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'PURCHASE',
  `date` datetime DEFAULT NULL,
  `supplierId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `totalAmount` float DEFAULT NULL,
  `amountPaid` float DEFAULT NULL,
  `paymentStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentHistory` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `originalPurchaseId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isReturned` tinyint(1) DEFAULT '0',
  `returnNote` text COLLATE utf8mb4_unicode_ci,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustments`
--

CREATE TABLE `stock_adjustments` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime DEFAULT NULL,
  `productId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'INCREASE, DECREASE',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` int NOT NULL,
  `previousStock` int NOT NULL DEFAULT '0',
  `currentStock` int NOT NULL DEFAULT '0',
  `note` text COLLATE utf8mb4_unicode_ci,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storesettings`
--

CREATE TABLE `storesettings` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jargon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankAccount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footerMessage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `showAddress` tinyint(1) DEFAULT NULL,
  `showJargon` tinyint(1) DEFAULT NULL,
  `showBank` tinyint(1) DEFAULT NULL,
  `printerType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `storesettings`
--

INSERT INTO `storesettings` (`id`, `name`, `jargon`, `address`, `phone`, `bankAccount`, `footerMessage`, `notes`, `showAddress`, `showJargon`, `showBank`, `printerType`, `createdAt`, `updatedAt`) VALUES
('settings', 'Cemilan KasirPOS Nusantara', 'Pusat Jajanan & Snack Kiloan Terlengkap', 'Jl. Raya Nusantara No. 123, Jakarta Selatan', '0812-3456-7890', 'BCA 8820123456 a.n Cemilan Nusantara\nBRI 1234-01-000001-50-1 a.n Cemilan Nusantara', 'Terima kasih telah berbelanja di Cemilan Nusantara!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.', 'Toko Buka Setiap Hari: 08.00 - 21.00 WIB', 1, 1, 1, 'A4', '2025-11-21 03:21:02', '2025-11-24 05:57:11');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'SALE',
  `originalTransactionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `totalAmount` float DEFAULT NULL,
  `amountPaid` float DEFAULT NULL,
  `change` float DEFAULT NULL,
  `paymentStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentNote` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cashierId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cashierName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentHistory` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `isReturned` tinyint(1) DEFAULT '0',
  `returnNote` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount` float DEFAULT '0',
  `discountType` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'FIXED',
  `discountAmount` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `image`, `createdAt`, `updatedAt`) VALUES
('admin_id', 'Administrator', 'admin', '$2b$10$/G1LVJ0rrpGXYlII4afPVuWGyRFU/l7/j6xih.PHyjGWxz4tDti/y', 'OWNER', NULL, '2025-11-25 10:47:56', '2025-11-25 11:34:40'),
('b7863125-5f8a-4c95-b967-653109eec648', 'Admin Kasir', 'adminkasir', '$2y$10$LH8AcW6n98Q5H7C0C8bEi.kBKQQzGCtSriW5Ym0Rlq9LmplXVS3S6', 'ADMIN', '', '2026-04-15 08:45:51', '2026-04-15 08:45:51'),
('u0', 'Super Admin', 'superadmin', '$2b$10$UB90LOpqEIwAyvBtAeF52evLO/5Yt4/poy6fhH7KdIvR0ys4YhkRK', 'SUPERADMIN', NULL, '2025-11-21 03:21:02', '2025-11-25 11:33:14'),
('u1', 'Owner Cemilan', 'owner', '$2b$10$4sYmZyehNKuN1n8dzDKHz.cmSco8GgEWQqrloKetJ3c77/h7kWkMO', 'OWNER', NULL, '2025-11-21 03:24:32', '2025-11-25 11:32:07'),
('u2', 'Kasir 1', 'kasir1', '$2b$10$6H2N0HLdQvj0mdRyXJJGguTDbQ0ajPjXecRGSdLjtMHSPxlDqzoEi', 'CASHIER', NULL, '2025-11-21 03:21:52', '2025-11-25 11:32:49'),
('u3', 'Kasir 2', 'kasir2', '$2b$10$AZdWcW7.OLT/Gxg9PB0YK.pr5BZQZKtmYBZWp5lbYT3NmOBXC4LHa', 'CASHIER', NULL, '2025-11-21 04:10:15', '2025-11-25 11:33:25'),
('u4', 'Kasir 3', 'kasir3', '$2b$10$5N8c8K5usZP5jwuHGs3iK.3OGbT00UaPip5JcPHN2ugWmmy544pWu', 'CASHIER', NULL, '2025-11-21 04:15:20', '2025-11-25 11:33:32'),
('u5', 'Manager Toko', 'manager', '$2b$10$2fldSagGxNYKQ3cB1yPOm.ClyYtT./4kUQ64wjUaX/waaTGcBhqw6', 'OWNER', NULL, '2025-11-21 04:20:25', '2025-11-25 11:33:38'),
('u6', 'Kasir Pagi', 'kasir_pagi', '$2b$10$0bXTDmflLgEspfgRBRTMw.NKtWjLIcVbF.UUbRy6FCL.uk6uN5nB2', 'CASHIER', NULL, '2025-11-21 04:25:30', '2025-11-25 11:33:45'),
('u7', 'Kasir Siang', 'kasir_siang', '$2b$10$Gk2cX87xmG4qXzhVecgIc.5tOu8/K66d1Jht5GRp9fRT3WzcMlmPC', 'CASHIER', NULL, '2025-11-21 04:30:35', '2025-11-25 11:33:52'),
('u8', 'Kasir Malam', 'kasir_malam', '$2b$10$rYG4ahh6.9mwmhx8kU3.C.O9K7rnK7QtazCyXco/L93/cyqKBo4i6', 'CASHIER', NULL, '2025-11-21 04:35:40', '2025-11-25 11:33:59'),
('u9', 'Admin Gudang', 'admin_gudang', '$2b$10$VtQsjF/RCt/fJ3yiIfcBRuUchPStEDALdxbaHcCU/NLula4VWiHOa', 'OWNER', NULL, '2025-11-21 04:40:45', '2025-11-25 11:34:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bankaccounts`
--
ALTER TABLE `bankaccounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cashflows`
--
ALTER TABLE `cashflows`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `storesettings`
--
ALTER TABLE `storesettings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `username_20` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
