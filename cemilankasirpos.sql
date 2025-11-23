-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 22, 2025 at 10:00 AM
-- Server version: 8.4.3
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cemilankasirpos`
--

-- --------------------------------------------------------

--
-- Table structure for table `bankaccounts`
--

CREATE TABLE `bankaccounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `accountNumber` varchar(255) DEFAULT NULL,
  `holderName` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bankaccounts`
--

INSERT INTO `bankaccounts` (`id`, `bankName`, `accountNumber`, `holderName`, `createdAt`, `updatedAt`) VALUES
('b1', 'BCA', '8820123456', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b2', 'BRI', '1234-01-000001-50-1', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b3', 'Mandiri', '133-00-1234567-8', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b4', 'Dana', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b5', 'GoPay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b6', 'ShopeePay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `cashflows`
--

CREATE TABLE `cashflows` (
  `id` varchar(255) NOT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `bankId` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
('c1', 'Keripik & Kerupuk', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c2', 'Basreng & Seblak', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c3', 'Makaroni & Mie Lidi', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c4', 'Kacang & Polong', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c5', 'Kue Kering & Sus', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c6', 'Coklat & Permen', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c7', 'Minuman Kemasan', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('c8', 'Paket Hampers', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `image` longtext,
  `defaultPriceType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `image`, `defaultPriceType`, `createdAt`, `updatedAt`) VALUES
('cust1', 'Pelanggan Umum', '-', '-', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust2', 'Warung Madura \"Cak Imin\"', '0812-3333-4444', 'Jl. Raya Bogor KM 25', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust3', 'Toko Kelontong \"Bu Yati\"', '0815-6666-7777', 'Pasar Minggu Blok A1', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust4', 'Kantin SD 01 \"Pak Budi\"', '0818-9999-0000', 'Jl. Sekolah No. 1', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust5', 'Siti Aminah', '0857-1234-5678', 'Komplek Melati Indah', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust6', 'Andi Saputra', '0813-4567-8901', 'Jl. Kenanga No. 10', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust7', 'Agen Snack \"Raja Rasa\"', '0821-5555-9999', 'Ruko Grand Wisata', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `categoryId` varchar(255) DEFAULT NULL,
  `categoryName` varchar(255) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `hpp` float DEFAULT '0',
  `priceRetail` float DEFAULT '0',
  `priceGeneral` float DEFAULT '0',
  `priceWholesale` float DEFAULT '0',
  `pricePromo` float DEFAULT NULL,
  `image` longtext,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `sku`, `categoryId`, `categoryName`, `stock`, `hpp`, `priceRetail`, `priceGeneral`, `priceWholesale`, `pricePromo`, `image`, `createdAt`, `updatedAt`) VALUES
('p1', 'Keripik Singkong Balado \"Pedas Nampol\"', 'SNK-001', 'c1', 'Keripik & Kerupuk', 150, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p2', 'Keripik Pisang Coklat \"Lumer\"', 'SNK-002', 'c1', 'Keripik & Kerupuk', 85, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p3', 'Keripik Kaca \"Beling Pedas\"', 'SNK-003', 'c1', 'Keripik & Kerupuk', 200, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p4', 'Basreng Stik Daun Jeruk \"Sultan\"', 'SNK-004', 'c2', 'Basreng & Seblak', 120, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p5', 'Basreng Koin Original \"Gurih\"', 'SNK-005', 'c2', 'Basreng & Seblak', 90, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p6', 'Seblak Kering \"Mercon\"', 'SNK-006', 'c2', 'Basreng & Seblak', 60, 9000, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p7', 'Makaroni Bantet \"Setan Level 5\"', 'SNK-007', 'c3', 'Makaroni & Mie Lidi', 300, 4000, 8000, 7000, 6000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p8', 'Makaroni Spiral \"Keju Premium\"', 'SNK-008', 'c3', 'Makaroni & Mie Lidi', 180, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p9', 'Mie Lidi \"Si Umang 90an\"', 'SNK-009', 'c3', 'Makaroni & Mie Lidi', 150, 6000, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p10', 'Kacang Umpet \"Manis Karamel\"', 'SNK-010', 'c4', 'Kacang & Polong', 75, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p11', 'Kacang Atom \"Garuda KW Super\"', 'SNK-011', 'c4', 'Kacang & Polong', 100, 8000, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p12', 'Sus Kering \"Isi Coklat\"', 'SNK-012', 'c5', 'Kue Kering & Sus', 200, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p13', 'Soes Kering \"Keju Kraft\"', 'SNK-013', 'c5', 'Kue Kering & Sus', 180, 20000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p14', 'Coklat \"Kerikil Arab\"', 'SNK-014', 'c6', 'Coklat & Permen', 50, 25000, 40000, 38000, 35000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p15', 'Permen \"Yupi Kiloan\"', 'SNK-015', 'c6', 'Coklat & Permen', 80, 30000, 45000, 42000, 40000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p16', 'Usus Crispy \"Original\"', 'SNK-016', 'c1', 'Keripik & Kerupuk', 65, 13000, 22000, 20000, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p17', 'Usus Crispy \"Pedas\"', 'SNK-017', 'c1', 'Keripik & Kerupuk', 60, 13000, 22000, 20000, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p18', 'Kerupuk Seblak \"Mawar\"', 'SNK-018', 'c1', 'Keripik & Kerupuk', 100, 6000, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p19', 'Sale Pisang \"Basah\"', 'SNK-019', 'c1', 'Keripik & Kerupuk', 40, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p20', 'Emping Melinjo \"Manis\"', 'SNK-020', 'c1', 'Keripik & Kerupuk', 30, 30000, 45000, 42000, 40000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'PURCHASE',
  `date` datetime DEFAULT NULL,
  `supplierId` varchar(255) DEFAULT NULL,
  `supplierName` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `items` json DEFAULT NULL,
  `totalAmount` float DEFAULT NULL,
  `amountPaid` float DEFAULT NULL,
  `paymentStatus` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `bankId` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `paymentHistory` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storesettings`
--

CREATE TABLE `storesettings` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `jargon` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `bankAccount` varchar(255) DEFAULT NULL,
  `footerMessage` varchar(255) DEFAULT NULL,
  `notes` text,
  `showAddress` tinyint(1) DEFAULT NULL,
  `showPhone` tinyint(1) DEFAULT NULL,
  `showJargon` tinyint(1) DEFAULT NULL,
  `showBank` tinyint(1) DEFAULT NULL,
  `printerType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `storesettings`
--

INSERT INTO `storesettings` (`id`, `name`, `jargon`, `address`, `phone`, `bankAccount`, `footerMessage`, `notes`, `showAddress`, `showPhone`, `showJargon`, `showBank`, `printerType`, `createdAt`, `updatedAt`) VALUES
('settings', 'Cemilan KasirPOS Nusantara', 'Pusat Jajanan & Snack Kiloan Terlengkap', 'Jl. Raya Nusantara No. 123, Jakarta Selatan', '0812-3456-7890', 'BCA 8820123456 a.n Cemilan Nusantara\nBRI 1234-01-000001-50-1 a.n Cemilan Nusantara', 'Terima kasih telah berbelanja di Cemilan Nusantara!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.', 'Toko Buka Setiap Hari: 08.00 - 21.00 WIB', 1, 1, 1, 1, '58mm', '2025-11-21 03:21:02', '2025-11-21 08:22:58');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `image` longtext,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `phone`, `address`, `image`, `createdAt`, `updatedAt`) VALUES
('sup1', 'UD. Sumber Snack Jaya (Bandung)', '0812-2222-3333', 'Jl. Cibaduyut No. 45, Bandung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup2', 'CV. Aneka Rasa Nusantara (Jakarta)', '0813-4444-5555', 'Kawasan Industri Pulogadung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup3', 'Agen Keripik \"Bu Susi\" (Malang)', '0856-7777-8888', 'Jl. Apel No. 88, Batu, Malang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup4', 'Grosir Cemilan \"Berkah\" (Surabaya)', '0819-0000-1111', 'Pasar Turi Baru Lt. 1', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup5', 'Pabrik Makaroni \"Ngehe\" (Tasik)', '0822-3333-9999', 'Tasikmalaya Kota', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'SALE',
  `originalTransactionId` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `items` json DEFAULT NULL,
  `totalAmount` float DEFAULT NULL,
  `amountPaid` float DEFAULT NULL,
  `change` float DEFAULT NULL,
  `paymentStatus` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `paymentNote` varchar(255) DEFAULT NULL,
  `bankId` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `customerId` varchar(255) DEFAULT NULL,
  `customerName` varchar(255) DEFAULT NULL,
  `cashierId` varchar(255) DEFAULT NULL,
  `cashierName` varchar(255) DEFAULT NULL,
  `paymentHistory` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `image` longtext,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `image`, `createdAt`, `updatedAt`) VALUES
('6mw2fkzy7', 'Owner Cemilan', 'owner', '$2y$12$GLk1vHYJJj3QLGghAt4TH.AQkw8lUmt0BVlsau6ckXTDNAi93DprC', 'OWNER', NULL, '2025-11-21 03:24:32', '2025-11-21 03:24:32'),
('kp33oj5rr', 'Kasir 1', 'kasir', '$2y$12$eAAd5LS3j7UJm/QCVXR0uOItMrJ9KVZeY3dQUvB//vu7p8OVCkvma', 'CASHIER', NULL, '2025-11-21 03:21:52', '2025-11-21 03:27:53'),
('u0', 'Super Admin', 'superadmin', '$2y$12$hxvCWcny3.Hyd1FCH.OyFeUd3YPp.UasHQv5L.pUkG.1CElFPx47W', 'SUPERADMIN', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');

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
  ADD UNIQUE KEY `username` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
