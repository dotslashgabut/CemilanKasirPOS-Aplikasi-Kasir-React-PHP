-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 25, 2025 at 11:42 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

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
('b10', 'BTN', '00123-01-30-000567-8', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b11', 'Bank Jago', '100987654321', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b12', 'Jenius BTPN', '90123456789', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b13', 'Blu BCA Digital', '001234567890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b14', 'SeaBank', '8800123456789', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b15', 'BCA (Cabang Sudirman)', '8821234567', 'Owner Cemilan', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b16', 'Mandiri (Tabungan)', '135-00-9876543-2', 'Owner Cemilan', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b17', 'Dana', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b18', 'GoPay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b19', 'ShopeePay', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b2', 'BRI', '1234-01-000001-50-1', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b20', 'OVO', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b21', 'LinkAja', '0812-3456-7890', 'Admin Toko', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b22', 'Dana', '0856-9999-8888', 'Owner Cemilan', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b23', 'GoPay', '0856-9999-8888', 'Owner Cemilan', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b24', 'ShopeePay', '0821-7777-6666', 'Kasir 1', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b25', 'OVO', '0821-7777-6666', 'Kasir 1', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b26', 'PayPal', 'cemilan@e-mail.com', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-23 00:38:10'),
('b27', 'QRIS (BCA)', 'ID1234567890QRIS', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b28', 'QRIS (Mandiri)', 'ID9876543210QRIS', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b3', 'Mandiri', '133-00-1234567-8', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b4', 'BNI', '0123456789', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b5', 'CIMB Niaga', '800123456789', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b6', 'Permata Bank', '0987654321', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b7', 'Danamon', '1122334455', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b8', 'BSI (Bank Syariah Indonesia)', '7001234567', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('b9', 'Bank Mega', '01-654-321987-0', 'Cemilan Nusantara', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

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
  `updatedAt` datetime NOT NULL,
  `referenceId` varchar(255) DEFAULT NULL
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
('cust10', 'Mini Market \"Berkah\"', '0819-5555-6666', 'Jl. Kebon Jeruk No. 88', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust100', 'PT Snack Indonesia', '0823-6666-7777', 'Kawasan Industri Pulo Gadung', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust11', 'Dewi Kartika', '0858-7777-8888', 'Perum Griya Asri Blok C5', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust12', 'Budi Santoso', '0817-9999-0000', 'Jl. Merpati No. 12', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust13', 'Kantin SMP 05 \"Bu Sari\"', '0811-2222-3333', 'Jl. Pendidikan No. 5', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust14', 'Warung Tegal \"Mas Agus\"', '0823-4444-5555', 'Jl. Gatot Subroto KM 8', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust15', 'Toko Makmur Jaya', '0814-6666-7777', 'Pasar Raya Lt. 2 No. 15', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust16', 'Rina Puspita', '0859-8888-9999', 'Komplek Permata Hijau', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust17', 'Tommy Kurniawan', '0816-0000-1111', 'Jl. Flamboyan No. 7', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust18', 'Kantin SMA 02 \"Pak Rahman\"', '0824-2222-3333', 'Jl. Pelajar No. 20', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust19', 'Agen Cemilan \"Sukses\"', '0812-4444-5555', 'Ruko Mega Mall Blok F', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust2', 'Warung Madura \"Cak Imin\"', '0812-3333-4444', 'Jl. Raya Bogor KM 25', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust20', 'Warung Sunda \"Ibu Euis\"', '0825-6666-7777', 'Jl. Cibaduyut No. 33', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust21', 'Lina Marlina', '0855-8888-9999', 'Jl. Anggrek No. 18', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust22', 'Hendra Gunawan', '0813-0000-1111', 'Komplek Citra Garden', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust23', 'Toko Serba Ada \"Amanah\"', '0826-2222-3333', 'Pasar Senen Blok C3', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust24', 'Kantin Kampus \"Mas Doni\"', '0821-4444-5555', 'Kampus UI Depok', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust25', 'Mini Market \"Sinar Jaya\"', '0818-6666-7777', 'Jl. Raya Bekasi KM 15', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust26', 'Maya Sari', '0857-8888-9999', 'Perum Bumi Asri', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust27', 'Rudi Hermawan', '0812-0000-1111', 'Jl. Mawar No. 25', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust28', 'Warung Padang \"Uni Ros\"', '0827-2222-3333', 'Jl. HR Rasuna Said', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust29', 'Distributor \"Maju Bersama\"', '0819-4444-5555', 'Kawasan Industri Cakung', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust3', 'Toko Kelontong \"Bu Yati\"', '0815-6666-7777', 'Pasar Minggu Blok A1', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust30', 'Toko Langgeng', '0828-6666-7777', 'Pasar Jatinegara Blok A', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust31', 'Nurul Hidayah', '0856-8888-9999', 'Jl. Dahlia No. 9', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust32', 'Agung Prasetyo', '0811-0000-1111', 'Komplek Taman Sari', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust33', 'Kantin Pabrik \"Bu Ningsih\"', '0829-2222-3333', 'Kawasan Industri MM2100', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust34', 'Agen Snack \"Fortuna\"', '0822-4444-5555', 'Ruko BSD City', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust35', 'Warung Bu Lastri', '0815-6666-7777', 'Jl. Tebet Timur No. 50', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust36', 'Fitri Rahmawati', '0858-8888-9999', 'Jl. Tulip No. 14', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust37', 'Dedi Supardi', '0817-0000-1111', 'Perum Mandala Asri', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust38', 'Toko \"Serba Murah\"', '0820-2222-3333', 'Pasar Kebayoran Blok D', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust39', 'Kantin Karyawan \"Pak Hadi\"', '0823-4444-5555', 'Gedung Perkantoran Kuningan', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust4', 'Kantin SD 01 \"Pak Budi\"', '0818-9999-0000', 'Jl. Sekolah No. 1', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust40', 'Mini Market \"Sejahtera\"', '0814-6666-7777', 'Jl. Raya Cibubur', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust41', 'Siska Wulandari', '0859-8888-9999', 'Jl. Sakura No. 22', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust42', 'Bambang Wijaya', '0816-0000-1111', 'Komplek Green Valley', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust43', 'Warung Jawa \"Mbak Tini\"', '0821-2222-3333', 'Jl. Kramat Raya No. 77', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust44', 'Distributor \"Cahaya\"', '0824-4444-5555', 'Ruko Lippo Karawaci', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust45', 'Toko Barokah', '0818-6666-7777', 'Pasar Anyar Blok E', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust46', 'Yuni Astuti', '0855-8888-9999', 'Jl. Cempaka No. 31', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust47', 'Irwan Setiawan', '0812-0000-1111', 'Perum Pondok Indah', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust48', 'Kantin Sekolah \"Bu Wati\"', '0825-2222-3333', 'SDN 08 Jakarta', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust49', 'Agen \"Mitra Sejati\"', '0826-4444-5555', 'Ruko Gading Serpong', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust5', 'Siti Aminah', '0857-1234-5678', 'Komplek Melati Indah', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust50', 'Warung \"Pak Harjo\"', '0819-6666-7777', 'Jl. Pancoran Barat', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust51', 'Ratna Dewi', '0857-8888-9999', 'Jl. Melati No. 5', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust52', 'Joko Susilo', '0813-0000-1111', 'Komplek Puri Mas', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust53', 'Toko \"Setia Kawan\"', '0827-2222-3333', 'Pasar Cempaka Putih', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust54', 'Kantin Gedung \"Mas Eko\"', '0828-4444-5555', 'Gedung BRI Lt. 2', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust55', 'Mini Market \"Jaya Abadi\"', '0822-6666-7777', 'Jl. Raya Cikarang', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust56', 'Eko Prasetyo', '0856-8888-9999', 'Jl. Kenari No. 28', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust57', 'Sri Wahyuni', '0811-0000-1111', 'Perum Serpong Garden', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust58', 'Warung Betawi \"Bang Udin\"', '0829-2222-3333', 'Jl. Condet Raya', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust59', 'Distributor \"Harapan\"', '0820-4444-5555', 'Ruko Alam Sutera', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust6', 'Andi Saputra', '0813-4567-8901', 'Jl. Kenanga No. 10', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust60', 'Toko Mitra Usaha', '0823-6666-7777', 'Pasar Rumput Blok F', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust61', 'Wati Suryani', '0858-8888-9999', 'Jl. Bougenville No. 16', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust62', 'Hendro Siswanto', '0817-0000-1111', 'Komplek Bintaro Jaya', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust63', 'Kantin \"Bu Dewi\"', '0821-2222-3333', 'SMKN 12 Jakarta', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust64', 'Agen \"Berkah Makmur\"', '0824-4444-5555', 'Ruko Summarecon Bekasi', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust65', 'Warung \"Mas Tanto\"', '0818-6666-7777', 'Jl. Kalibata Timur', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust66', 'Indah Permata', '0855-8888-9999', 'Jl. Mawar Merah No. 11', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust67', 'Wahyu Hidayat', '0812-0000-1111', 'Perum Modernland', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust68', 'Toko \"Rejeki Nomplok\"', '0825-2222-3333', 'Pasar Kramat Jati', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust69', 'Kantin Rumah Sakit \"Pak Tono\"', '0826-4444-5555', 'RS Mitra Keluarga', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust7', 'Agen Snack \"Raja Rasa\"', '0821-5555-9999', 'Ruko Grand Wisata', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust70', 'Mini Market \"Sentosa\"', '0819-6666-7777', 'Jl. Raya Serpong', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust71', 'Ani Susilowati', '0857-8888-9999', 'Jl. Orchid No. 19', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust72', 'Fajar Nugraha', '0813-0000-1111', 'Komplek Galaxy Bekasi', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust73', 'Warung \"Mbok Minah\"', '0827-2222-3333', 'Jl. Fatmawati Raya', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust74', 'Distributor \"Sumber Rezeki\"', '0828-4444-5555', 'Ruko Citra Raya', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust75', 'Toko Harapan Jaya', '0822-6666-7777', 'Pasar Cipulir Blok C', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust76', 'Rina Safitri', '0856-8888-9999', 'Jl. Lavender No. 24', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust77', 'Arief Rahman', '0811-0000-1111', 'Perum Pamulang Permai', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust78', 'Kantin \"Bu Lasmi\"', '0829-2222-3333', 'Universitas Pancasila', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust79', 'Agen \"Sentosa Jaya\"', '0820-4444-5555', 'Ruko PIK Avenue', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust8', 'Warung Kopi \"Pak Jumadi\"', '0856-1111-2222', 'Jl. Sudirman No. 45', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust80', 'Warung \"Pak Karso\"', '0823-6666-7777', 'Jl. Cilandak KKO', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust81', 'Mega Lestari', '0858-8888-9999', 'Jl. Lily No. 8', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust82', 'Yanto Prasetyo', '0817-0000-1111', 'Komplek Harapan Indah', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust83', 'Toko \"Murah Meriah\"', '0821-2222-3333', 'Pasar Santa Blok B', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust84', 'Kantin Mall \"Mas Agung\"', '0824-4444-5555', 'Mall Kelapa Gading', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust85', 'Mini Market \"Rezeki\"', '0818-6666-7777', 'Jl. Raya Bojonggede', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust86', 'Putri Ayu', '0855-8888-9999', 'Jl. Aster No. 13', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust87', 'Sutrisno', '0812-0000-1111', 'Perum Taman Yasmin', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust88', 'Warung \"Bu Sri\"', '0825-2222-3333', 'Jl. Saharjo Raya', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust89', 'Distributor \"Maju Lancar\"', '0826-4444-5555', 'Ruko Mega Kuningan', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust9', 'Toko Sumber Rejeki', '0822-3333-4444', 'Pasar Tanah Abang Blok B', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust90', 'Toko Karya Mandiri', '0819-6666-7777', 'Pasar Blok M', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust91', 'Vina Rahmawati', '0857-8888-9999', 'Jl. Kamboja No. 27', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust92', 'Deni Kurniawan', '0813-0000-1111', 'Komplek Grand Depok City', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust93', 'Kantin \"Pak Usman\"', '0827-2222-3333', 'SMA Plus Negeri 8', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust94', 'Agen \"Mandiri Jaya\"', '0828-4444-5555', 'Ruko Kota Wisata', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust95', 'Warung \"Mbak Iin\"', '0822-6666-7777', 'Jl. Mampang Prapatan', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust96', 'Toko Berkah Selalu', '0856-8888-9999', 'Pasar Mayestik Blok A', NULL, 'GROSIR', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust97', 'Lisa Anggraini', '0811-0000-1111', 'Jl. Gardenia No. 6', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust98', 'Anton Suryadi', '0829-2222-3333', 'Komplek Ciputat Mas', NULL, 'ECERAN', '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('cust99', 'Kantin Koperasi \"Bu Tuti\"', '0820-4444-5555', 'Kantor Pusat PLN', NULL, 'UMUM', '2025-11-21 03:21:02', '2025-11-21 03:21:02');

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
('p1', 'Keripik Singkong Balado \"Pedas Nampol\"', 'SNK-001', 'c1', 'Keripik & Kerupuk', 150, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-25 11:38:22'),
('p10', 'Kacang Umpet \"Manis Karamel\"', 'SNK-010', 'c4', 'Kacang & Polong', 68, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-25 11:37:08'),
('p100', 'Paket Hampers Lebaran A', 'SNK-100', 'c8', 'Paket Hampers', 25, 150000, 250000, 230000, 210000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p101', 'Paket Hampers Lebaran B', 'SNK-101', 'c8', 'Paket Hampers', 18, 200000, 320000, 300000, 280000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p102', 'Paket Snack Arisan', 'SNK-102', 'c8', 'Paket Hampers', 35, 100000, 165000, 155000, 145000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p103', 'Paket Snack Kantor', 'SNK-103', 'c8', 'Paket Hampers', 42, 120000, 190000, 175000, 165000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p104', 'Rempeyek Kacang \"Renyah\"', 'SNK-104', 'c1', 'Keripik & Kerupuk', 98, 8500, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-24 19:58:00'),
('p105', 'Rempeyek Teri \"Super Kriuk\"', 'SNK-105', 'c1', 'Keripik & Kerupuk', 75, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p106', 'Opak Ketan \"Original\"', 'SNK-106', 'c1', 'Keripik & Kerupuk', 62, 7500, 14500, 13000, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p107', 'Keripik Pare \"Pedas Manis\"', 'SNK-107', 'c1', 'Keripik & Kerupuk', 42, 14000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p108', 'Keripik Nangka \"Original\"', 'SNK-108', 'c1', 'Keripik & Kerupuk', 38, 20000, 33000, 31000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p109', 'Kripik Pisang Gepeng', 'SNK-109', 'c1', 'Keripik & Kerupuk', 88, 9500, 17500, 16000, 14500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p11', 'Kacang Atom \"Garuda KW Super\"', 'SNK-011', 'c4', 'Kacang & Polong', 100, 8000, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p110', 'Sale Pisang \"Kering Manis\"', 'SNK-110', 'c1', 'Keripik & Kerupuk', 52, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p111', 'Stick Balado \"Super Pedas\"', 'SNK-111', 'c3', 'Makaroni & Mie Lidi', 215, 4500, 9000, 8000, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p112', 'Combro Krispi \"Isi Oncom\"', 'SNK-112', 'c2', 'Basreng & Seblak', 68, 12500, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p113', 'Pisang Molen \"Mini\"', 'SNK-113', 'c5', 'Kue Kering & Sus', 92, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p114', 'Brownies Kukus \"Premium\"', 'SNK-114', 'c5', 'Kue Kering & Sus', 45, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p115', 'Donat Mini \"Mix Topping\"', 'SNK-115', 'c5', 'Kue Kering & Sus', 105, 18000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p116', 'Mochi \"Mix Flavor\"', 'SNK-116', 'c6', 'Coklat & Permen', 138, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-24 19:32:46'),
('p117', 'Arumanis \"Kacang Mete\"', 'SNK-117', 'c6', 'Coklat & Permen', 85, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p118', 'Dodol Garut \"Premium\"', 'SNK-118', 'c6', 'Coklat & Permen', 58, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p119', 'Jenang Kudus \"Mix\"', 'SNK-119', 'c6', 'Coklat & Permen', 38, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-24 20:13:54'),
('p12', 'Sus Kering \"Isi Coklat\"', 'SNK-012', 'c5', 'Kue Kering & Sus', 200, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p120', 'Wajik Ketan \"Gula Merah\"', 'SNK-120', 'c6', 'Coklat & Permen', 65, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p121', 'Keripik Bayam \"Crispy\"', 'SNK-121', 'c1', 'Keripik & Kerupuk', 95, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p122', 'Keripik Ubi \"Ungu\"', 'SNK-122', 'c1', 'Keripik & Kerupuk', 78, 8000, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p123', 'Keripik Kulit \"Renyah\"', 'SNK-123', 'c1', 'Keripik & Kerupuk', 102, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p124', 'Keripik Sukun \"Original\"', 'SNK-124', 'c1', 'Keripik & Kerupuk', 68, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p125', 'Keripik Wortel \"Manis\"', 'SNK-125', 'c1', 'Keripik & Kerupuk', 55, 12000, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p126', 'Keripik Apel \"Malang\"', 'SNK-126', 'c1', 'Keripik & Kerupuk', 42, 25000, 40000, 37000, 34000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p127', 'Keripik Salak \"Pondoh\"', 'SNK-127', 'c1', 'Keripik & Kerupuk', 38, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p128', 'Keripik Talas \"Bogor\"', 'SNK-128', 'c1', 'Keripik & Kerupuk', 88, 9500, 17500, 16000, 14500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p129', 'Keripik Getas \"Ketan\"', 'SNK-129', 'c1', 'Keripik & Kerupuk', 112, 7000, 13500, 12500, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p13', 'Soes Kering \"Keju Kraft\"', 'SNK-013', 'c5', 'Kue Kering & Sus', 180, 20000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p130', 'Keripik Belut \"Crispy\"', 'SNK-130', 'c1', 'Keripik & Kerupuk', 28, 35000, 55000, 52000, 48000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p131', 'Basreng \"Mini Balado\"', 'SNK-131', 'c2', 'Basreng & Seblak', 125, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p132', 'Basreng \"Isi Ayam\"', 'SNK-132', 'c2', 'Basreng & Seblak', 98, 14000, 23000, 21500, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p133', 'Seblak \"Ceker Pedas\"', 'SNK-133', 'c2', 'Basreng & Seblak', 72, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p134', 'Seblak \"Tulang Rangu\"', 'SNK-134', 'c2', 'Basreng & Seblak', 65, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p135', 'Cireng \"Bumbu Kacang\"', 'SNK-135', 'c2', 'Basreng & Seblak', 88, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-24 19:33:51'),
('p136', 'Cireng \"Isi Oncom\"', 'SNK-136', 'c2', 'Basreng & Seblak', 75, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p137', 'Cimol \"Keju Lumer\"', 'SNK-137', 'c2', 'Basreng & Seblak', 105, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p138', 'Cilok \"Kuah Kacang\"', 'SNK-138', 'c2', 'Basreng & Seblak', 92, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p139', 'Cuanki Krispi \"Original\"', 'SNK-139', 'c2', 'Basreng & Seblak', 58, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p14', 'Coklat \"Kerikil Arab\"', 'SNK-014', 'c6', 'Coklat & Permen', 50, 25000, 40000, 38000, 35000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p140', 'Gehu Crispy \"Isi Tahu\"', 'SNK-140', 'c2', 'Basreng & Seblak', 68, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p141', 'Makaroni \"Jagung Manis\"', 'SNK-141', 'c3', 'Makaroni & Mie Lidi', 225, 4500, 9000, 8000, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p142', 'Makaroni \"Sapi Panggang\"', 'SNK-142', 'c3', 'Makaroni & Mie Lidi', 198, 5800, 11500, 10500, 9500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p143', 'Makaroni \"Bawang Putih\"', 'SNK-143', 'c3', 'Makaroni & Mie Lidi', 245, 4000, 8000, 7000, 6000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p144', 'Makaroni \"Rumput Laut\"', 'SNK-144', 'c3', 'Makaroni & Mie Lidi', 188, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p145', 'Mie Lidi \"Balado\"', 'SNK-145', 'c3', 'Makaroni & Mie Lidi', 175, 6000, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p146', 'Mie Lidi \"Ayam Bawang\"', 'SNK-146', 'c3', 'Makaroni & Mie Lidi', 162, 6300, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p147', 'Stick Keju \"Cheddar\"', 'SNK-147', 'c3', 'Makaroni & Mie Lidi', 138, 7500, 14500, 13500, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p148', 'Stick Ubi \"Keju\"', 'SNK-148', 'c3', 'Makaroni & Mie Lidi', 118, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p149', 'Rambak Udang \"Krispi\"', 'SNK-149', 'c3', 'Makaroni & Mie Lidi', 85, 14000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p15', 'Permen \"Yupi Kiloan\"', 'SNK-015', 'c6', 'Coklat & Permen', 80, 30000, 45000, 42000, 40000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p150', 'Pilus \"Balado Merah\"', 'SNK-150', 'c3', 'Makaroni & Mie Lidi', 195, 7200, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p151', 'Kacang Mede \"Madu\"', 'SNK-151', 'c4', 'Kacang & Polong', 48, 42000, 68000, 63000, 58000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p152', 'Kacang Pistachio \"Premium\"', 'SNK-152', 'c4', 'Kacang & Polong', 22, 75000, 115000, 108000, 100000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p153', 'Kacang Walnut \"Panggang\"', 'SNK-153', 'c4', 'Kacang & Polong', 18, 85000, 130000, 122000, 115000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p154', 'Kacang Kenari \"Original\"', 'SNK-154', 'c4', 'Kacang & Polong', 15, 95000, 145000, 138000, 130000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p155', 'Kacang Brazil \"Import\"', 'SNK-155', 'c4', 'Kacang & Polong', 12, 105000, 160000, 152000, 145000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p156', 'Kacang Tanah \"BBQ\"', 'SNK-156', 'c4', 'Kacang & Polong', 135, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p157', 'Kacang Tanah \"Balado\"', 'SNK-157', 'c4', 'Kacang & Polong', 142, 9800, 17500, 16000, 14500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p158', 'Kacang Telur \"BBQ\"', 'SNK-158', 'c4', 'Kacang & Polong', 95, 13500, 22500, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p159', 'Kacang Hijau \"Kupas\"', 'SNK-159', 'c4', 'Kacang & Polong', 108, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p16', 'Usus Crispy \"Original\"', 'SNK-016', 'c1', 'Keripik & Kerupuk', 65, 13000, 22000, 20000, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p160', 'Kacang Garuda \"Original\"', 'SNK-160', 'c4', 'Kacang & Polong', 158, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p161', 'Nastar \"Mini\"', 'SNK-161', 'c5', 'Kue Kering & Sus', 168, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p162', 'Nastar \"Jumbo\"', 'SNK-162', 'c5', 'Kue Kering & Sus', 85, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p163', 'Kastengel \"Mini\"', 'SNK-163', 'c5', 'Kue Kering & Sus', 152, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p164', 'Putri Salju \"Coklat\"', 'SNK-164', 'c5', 'Kue Kering & Sus', 138, 21000, 33000, 31000, 29000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p165', 'Lidah Kucing \"Coklat\"', 'SNK-165', 'c5', 'Kue Kering & Sus', 125, 20000, 31000, 29000, 27000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p166', 'Kue Kacang \"Mede\"', 'SNK-166', 'c5', 'Kue Kering & Sus', 142, 18000, 29000, 27000, 25000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p167', 'Sagu Keju \"Mini\"', 'SNK-167', 'c5', 'Kue Kering & Sus', 165, 16000, 26500, 24500, 22500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p168', 'Semprit \"Susu\"', 'SNK-168', 'c5', 'Kue Kering & Sus', 118, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p169', 'Cookies \"Red Velvet\"', 'SNK-169', 'c5', 'Kue Kering & Sus', 92, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p17', 'Usus Crispy \"Pedas\"', 'SNK-017', 'c1', 'Keripik & Kerupuk', 60, 13000, 22000, 20000, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p170', 'Cookies \"Oatmeal\"', 'SNK-170', 'c5', 'Kue Kering & Sus', 105, 23000, 36000, 34000, 31000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p171', 'Coklat Cadbury \"Kiloan\"', 'SNK-171', 'c6', 'Coklat & Permen', 62, 35000, 55000, 52000, 48000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p172', 'Coklat Toblerone \"Mini\"', 'SNK-172', 'c6', 'Coklat & Permen', 48, 38000, 60000, 56000, 52000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p173', 'Permen Mentos \"Roll\"', 'SNK-173', 'c6', 'Coklat & Permen', 185, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p174', 'Permen Foxs \"Kiloan\"', 'SNK-174', 'c6', 'Coklat & Permen', 165, 14000, 23000, 21000, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p175', 'Permen Sugus \"Mix\"', 'SNK-175', 'c6', 'Coklat & Permen', 142, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p176', 'Wafer Selamat \"Coklat\"', 'SNK-176', 'c6', 'Coklat & Permen', 175, 15000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p177', 'Wafer Richeese \"Keju\"', 'SNK-177', 'c6', 'Coklat & Permen', 158, 17000, 27000, 25000, 23000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p178', 'Wafer Nissin \"Kelapa\"', 'SNK-178', 'c6', 'Coklat & Permen', 145, 16500, 26500, 24500, 22500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p179', 'Mochi \"Kacang\"', 'SNK-179', 'c6', 'Coklat & Permen', 125, 17000, 27000, 25000, 23000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p18', 'Kerupuk Seblak \"Mawar\"', 'SNK-018', 'c1', 'Keripik & Kerupuk', 100, 6000, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p180', 'Mochi \"Wijen\"', 'SNK-180', 'c6', 'Coklat & Permen', 118, 17500, 27500, 25500, 23500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p181', 'Susu Ultra \"Coklat\"', 'SNK-181', 'c7', 'Minuman Kemasan', 145, 5500, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p182', 'Susu Ultra \"Full Cream\"', 'SNK-182', 'c7', 'Minuman Kemasan', 138, 5500, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p183', 'Yakult \"Original\"', 'SNK-183', 'c7', 'Minuman Kemasan', 225, 2000, 4000, 3500, 3000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p184', 'Ale-Ale \"Original\"', 'SNK-184', 'c7', 'Minuman Kemasan', 195, 3000, 6000, 5500, 5000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p185', 'Teh Botol Sosro', 'SNK-185', 'c7', 'Minuman Kemasan', 165, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p186', 'Mizone \"Lychee\"', 'SNK-186', 'c7', 'Minuman Kemasan', 128, 6000, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p187', 'Floridina \"Pulpy Orange\"', 'SNK-187', 'c7', 'Minuman Kemasan', 142, 5500, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p188', 'Fanta \"Strawberry\"', 'SNK-188', 'c7', 'Minuman Kemasan', 158, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p189', 'Sprite \"Botol\"', 'SNK-189', 'c7', 'Minuman Kemasan', 152, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p19', 'Sale Pisang \"Basah\"', 'SNK-019', 'c1', 'Keripik & Kerupuk', 40, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p190', 'Coca Cola \"Botol\"', 'SNK-190', 'c7', 'Minuman Kemasan', 175, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p191', 'Paket Hampers Natal A', 'SNK-191', 'c8', 'Paket Hampers', 22, 180000, 280000, 260000, 240000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p192', 'Paket Hampers Natal B', 'SNK-192', 'c8', 'Paket Hampers', 16, 220000, 350000, 330000, 310000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p193', 'Paket Snack Ulang Tahun', 'SNK-193', 'c8', 'Paket Hampers', 38, 90000, 150000, 140000, 130000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p194', 'Paket Snack Pernikahan', 'SNK-194', 'c8', 'Paket Hampers', 28, 160000, 260000, 245000, 230000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p195', 'Paket Snack Aqiqah', 'SNK-195', 'c8', 'Paket Hampers', 24, 140000, 230000, 215000, 200000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p196', 'Paket Snack Sekolah', 'SNK-196', 'c8', 'Paket Hampers', 55, 75000, 125000, 115000, 105000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p197', 'Paket Hampers Imlek', 'SNK-197', 'c8', 'Paket Hampers', 18, 250000, 400000, 380000, 360000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p198', 'Keripik Ceker \"Pedas\"', 'SNK-198', 'c1', 'Keripik & Kerupuk', 45, 32000, 52000, 48000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p199', 'Keripik Paru \"Crispy\"', 'SNK-199', 'c1', 'Keripik & Kerupuk', 38, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p2', 'Keripik Pisang Coklat \"Lumer\"', 'SNK-002', 'c1', 'Keripik & Kerupuk', 85, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p20', 'Emping Melinjo \"Manis\"', 'SNK-020', 'c1', 'Keripik & Kerupuk', 30, 30000, 45000, 42000, 40000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p200', 'Keripik Usus Ayam \"Original\"', 'SNK-200', 'c1', 'Keripik & Kerupuk', 52, 25000, 42000, 39000, 36000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p201', 'Keripik Bawang \"Goreng\"', 'SNK-201', 'c1', 'Keripik & Kerupuk', 168, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p202', 'Keripik Pangsit \"Original\"', 'SNK-202', 'c1', 'Keripik & Kerupuk', 142, 6500, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p203', 'Keripik Tapioka \"Warna\"', 'SNK-203', 'c1', 'Keripik & Kerupuk', 185, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p204', 'Kerupuk Mlarat \"Pedas\"', 'SNK-204', 'c1', 'Keripik & Kerupuk', 125, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p205', 'Kerupuk Gendar \"Original\"', 'SNK-205', 'c1', 'Keripik & Kerupuk', 108, 7500, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p206', 'Kerupuk Jangek \"Balado\"', 'SNK-206', 'c1', 'Keripik & Kerupuk', 48, 24000, 40000, 37000, 34000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p207', 'Kerupuk Kulit Sapi \"Original\"', 'SNK-207', 'c1', 'Keripik & Kerupuk', 65, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p208', 'Basreng \"Pedas Manis\"', 'SNK-208', 'c2', 'Basreng & Seblak', 112, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p209', 'Basreng \"Sosis\"', 'SNK-209', 'c2', 'Basreng & Seblak', 95, 13500, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p21', 'Keripik Singkong \"Original Gurih\"', 'SNK-021', 'c1', 'Keripik & Kerupuk', 175, 7000, 14000, 12500, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p210', 'Seblak \"Makaroni Kering\"', 'SNK-210', 'c2', 'Basreng & Seblak', 88, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p211', 'Seblak \"Ceker Keju\"', 'SNK-211', 'c2', 'Basreng & Seblak', 62, 17000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p212', 'Cireng \"Bumbu Rendang\"', 'SNK-212', 'c2', 'Basreng & Seblak', 78, 12500, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p213', 'Cimol \"Bumbu Kari\"', 'SNK-213', 'c2', 'Basreng & Seblak', 98, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p214', 'Cilok \"Bumbu Sate\"', 'SNK-214', 'c2', 'Basreng & Seblak', 85, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p215', 'Makaroni \"Sambal Matah\"', 'SNK-215', 'c3', 'Makaroni & Mie Lidi', 205, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p216', 'Makaroni \"Terasi\"', 'SNK-216', 'c3', 'Makaroni & Mie Lidi', 188, 4800, 9500, 8500, 7500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p217', 'Stick Singkong \"Keju\"', 'SNK-217', 'c3', 'Makaroni & Mie Lidi', 145, 6800, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p218', 'Stick Ubi \"Balado\"', 'SNK-218', 'c3', 'Makaroni & Mie Lidi', 132, 7200, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p219', 'Kacang Edamame \"Pedas\"', 'SNK-219', 'c4', 'Kacang & Polong', 115, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p22', 'Keripik Singkong \"Keju\"', 'SNK-022', 'c1', 'Keripik & Kerupuk', 140, 8500, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p220', 'Kacang Koro \"Balado Ijo\"', 'SNK-220', 'c4', 'Kacang & Polong', 102, 12500, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p221', 'Keripik Terong \"Ungu\"', 'SNK-221', 'c1', 'Keripik & Kerupuk', 72, 11000, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p222', 'Keripik Buncis \"Crispy\"', 'SNK-222', 'c1', 'Keripik & Kerupuk', 85, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p223', 'Keripik Labu \"Manis\"', 'SNK-223', 'c1', 'Keripik & Kerupuk', 68, 9500, 17500, 16000, 14500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p224', 'Keripik Pepaya \"Muda\"', 'SNK-224', 'c1', 'Keripik & Kerupuk', 55, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p225', 'Keripik Nangka \"Muda\"', 'SNK-225', 'c1', 'Keripik & Kerupuk', 42, 21000, 34000, 32000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p226', 'Keripik Mangga \"Muda\"', 'SNK-226', 'c1', 'Keripik & Kerupuk', 38, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p227', 'Keripik Nanas \"Manis\"', 'SNK-227', 'c1', 'Keripik & Kerupuk', 45, 22000, 36000, 34000, 31000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p228', 'Keripik Durian \"Premium\"', 'SNK-228', 'c1', 'Keripik & Kerupuk', 28, 45000, 70000, 65000, 60000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p229', 'Keripik Strawberry \"Asli\"', 'SNK-229', 'c1', 'Keripik & Kerupuk', 32, 38000, 60000, 56000, 52000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p23', 'Keripik Pisang \"Original Manis\"', 'SNK-023', 'c1', 'Keripik & Kerupuk', 95, 9000, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p230', 'Keripik Melon \"Crispy\"', 'SNK-230', 'c1', 'Keripik & Kerupuk', 35, 35000, 55000, 52000, 48000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p231', 'Basreng \"Cumi Pedas\"', 'SNK-231', 'c2', 'Basreng & Seblak', 78, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p232', 'Basreng \"Udang Balado\"', 'SNK-232', 'c2', 'Basreng & Seblak', 85, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p233', 'Basreng \"Keju Makaroni\"', 'SNK-233', 'c2', 'Basreng & Seblak', 92, 13500, 22500, 21000, 19500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p234', 'Seblak \"Mie Pedas\"', 'SNK-234', 'c2', 'Basreng & Seblak', 68, 10000, 17500, 16000, 14500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p235', 'Seblak \"Kuah Kering\"', 'SNK-235', 'c2', 'Basreng & Seblak', 75, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p236', 'Cireng \"Isi Abon\"', 'SNK-236', 'c2', 'Basreng & Seblak', 82, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p237', 'Cimol \"Pedas Nampol\"', 'SNK-237', 'c2', 'Basreng & Seblak', 95, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p238', 'Cilok \"Pedas Level 10\"', 'SNK-238', 'c2', 'Basreng & Seblak', 88, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p239', 'Tahu Crispy \"Original\"', 'SNK-239', 'c2', 'Basreng & Seblak', 105, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p24', 'Keripik Tempe \"Crispy Pedas\"', 'SNK-024', 'c1', 'Keripik & Kerupuk', 110, 7500, 14500, 13000, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p240', 'Tempe Crispy \"Balado\"', 'SNK-240', 'c2', 'Basreng & Seblak', 98, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p241', 'Makaroni \"Rendang\"', 'SNK-241', 'c3', 'Makaroni & Mie Lidi', 215, 5200, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p242', 'Makaroni \"Sate Padang\"', 'SNK-242', 'c3', 'Makaroni & Mie Lidi', 198, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p243', 'Makaroni \"Ayam Geprek\"', 'SNK-243', 'c3', 'Makaroni & Mie Lidi', 225, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p244', 'Makaroni \"Soto Betawi\"', 'SNK-244', 'c3', 'Makaroni & Mie Lidi', 188, 5300, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p245', 'Mie Lidi \"Sapi Lada Hitam\"', 'SNK-245', 'c3', 'Makaroni & Mie Lidi', 175, 6500, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p246', 'Mie Lidi \"Rendang\"', 'SNK-246', 'c3', 'Makaroni & Mie Lidi', 165, 6800, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p247', 'Stick Kentang \"Balado\"', 'SNK-247', 'c3', 'Makaroni & Mie Lidi', 142, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p248', 'Stick Talas \"Keju\"', 'SNK-248', 'c3', 'Makaroni & Mie Lidi', 128, 7500, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p249', 'Jamur Crispy \"Balado\"', 'SNK-249', 'c3', 'Makaroni & Mie Lidi', 68, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p25', 'Keripik Tahu \"Original\"', 'SNK-025', 'c1', 'Keripik & Kerupuk', 88, 7200, 14000, 12800, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p250', 'Pilus \"Crispy Bawang\"', 'SNK-250', 'c3', 'Makaroni & Mie Lidi', 205, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p251', 'Kacang Mente \"Garlic\"', 'SNK-251', 'c4', 'Kacang & Polong', 45, 48000, 75000, 70000, 65000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p252', 'Kacang Mixed Nuts \"Premium\"', 'SNK-252', 'c4', 'Kacang & Polong', 35, 65000, 100000, 95000, 90000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p253', 'Kacang Pecan \"Import\"', 'SNK-253', 'c4', 'Kacang & Polong', 20, 88000, 135000, 128000, 120000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p254', 'Kacang Macadamia \"Premium\"', 'SNK-254', 'c4', 'Kacang & Polong', 15, 105000, 160000, 152000, 145000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p255', 'Kacang Tanah \"Salted\"', 'SNK-255', 'c4', 'Kacang & Polong', 148, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p256', 'Kacang Tanah \"Sweet\"', 'SNK-256', 'c4', 'Kacang & Polong', 135, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p257', 'Kacang Telur \"Keju\"', 'SNK-257', 'c4', 'Kacang & Polong', 102, 14000, 23000, 21000, 19500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p258', 'Kacang Telur \"Balado\"', 'SNK-258', 'c4', 'Kacang & Polong', 98, 14500, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p259', 'Kacang Polong \"BBQ\"', 'SNK-259', 'c4', 'Kacang & Polong', 115, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p26', 'Keripik Jamur \"Kriuk Balado\"', 'SNK-026', 'c1', 'Keripik & Kerupuk', 55, 16000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p260', 'Kacang Polong \"Wasabi\"', 'SNK-260', 'c4', 'Kacang & Polong', 108, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p261', 'Nastar \"Keju\"', 'SNK-261', 'c5', 'Kue Kering & Sus', 158, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p262', 'Nastar \"Coklat\"', 'SNK-262', 'c5', 'Kue Kering & Sus', 145, 25000, 40000, 37000, 34000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p263', 'Kastengel \"Jumbo\"', 'SNK-263', 'c5', 'Kue Kering & Sus', 128, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p264', 'Putri Salju \"Green Tea\"', 'SNK-264', 'c5', 'Kue Kering & Sus', 118, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p265', 'Lidah Kucing \"Pandan\"', 'SNK-265', 'c5', 'Kue Kering & Sus', 132, 21000, 33000, 31000, 29000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p266', 'Kue Kacang \"Charcoal\"', 'SNK-266', 'c5', 'Kue Kering & Sus', 125, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p267', 'Sagu Keju \"Jumbo\"', 'SNK-267', 'c5', 'Kue Kering & Sus', 145, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p268', 'Semprit \"Coklat\"', 'SNK-268', 'c5', 'Kue Kering & Sus', 112, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p269', 'Cookies \"Double Chocolate\"', 'SNK-269', 'c5', 'Kue Kering & Sus', 95, 26000, 42000, 39000, 36000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p27', 'Keripik Kentang \"BBQ\"', 'SNK-027', 'c1', 'Keripik & Kerupuk', 130, 9500, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p270', 'Cookies \"Butter\"', 'SNK-270', 'c5', 'Kue Kering & Sus', 108, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p271', 'Coklat Ferrero \"Rocher\"', 'SNK-271', 'c6', 'Coklat & Permen', 38, 48000, 75000, 70000, 65000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p272', 'Coklat Lindt \"Premium\"', 'SNK-272', 'c6', 'Coklat & Permen', 32, 55000, 85000, 80000, 75000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p273', 'Permen Halls \"Candy\"', 'SNK-273', 'c6', 'Coklat & Permen', 175, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p274', 'Permen Relaxa \"Peppermint\"', 'SNK-274', 'c6', 'Coklat & Permen', 158, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p275', 'Permen Kis \"Mint\"', 'SNK-275', 'c6', 'Coklat & Permen', 165, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p276', 'Wafer Beng-Beng \"Coklat\"', 'SNK-276', 'c6', 'Coklat & Permen', 188, 15000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p277', 'Wafer Nabati \"Keju\"', 'SNK-277', 'c6', 'Coklat & Permen', 175, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p278', 'Wafer Superstar \"Vanilla\"', 'SNK-278', 'c6', 'Coklat & Permen', 162, 15500, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p279', 'Mochi \"Durian\"', 'SNK-279', 'c6', 'Coklat & Permen', 85, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p28', 'Keripik Buah Nangka', 'SNK-028', 'c1', 'Keripik & Kerupuk', 45, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p280', 'Mochi \"Coklat\"', 'SNK-280', 'c6', 'Coklat & Permen', 98, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p281', 'Susu Indomilk \"Coklat\"', 'SNK-281', 'c7', 'Minuman Kemasan', 152, 5000, 9500, 8500, 7500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p282', 'Susu Indomilk \"Strawberry\"', 'SNK-282', 'c7', 'Minuman Kemasan', 148, 5000, 9500, 8500, 7500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p283', 'Cimory \"Yogurt Drink\"', 'SNK-283', 'c7', 'Minuman Kemasan', 135, 6000, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p284', 'Calpico \"Original\"', 'SNK-284', 'c7', 'Minuman Kemasan', 118, 7000, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p285', 'Fruit Tea \"Blackcurrant\"', 'SNK-285', 'c7', 'Minuman Kemasan', 175, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p286', 'Minute Maid \"Pulpy Orange\"', 'SNK-286', 'c7', 'Minuman Kemasan', 132, 6500, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p287', 'Nutrisari \"Jeruk\"', 'SNK-287', 'c7', 'Minuman Kemasan', 195, 3500, 7000, 6500, 6000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p288', 'Teh Kotak \"Jasmine\"', 'SNK-288', 'c7', 'Minuman Kemasan', 168, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p289', 'Pepsi \"Botol\"', 'SNK-289', 'c7', 'Minuman Kemasan', 142, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p29', 'Basreng \"Keju Mozarella\"', 'SNK-029', 'c2', 'Basreng & Seblak', 105, 13000, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p290', 'Mountain Dew \"Botol\"', 'SNK-290', 'c7', 'Minuman Kemasan', 125, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p291', 'Paket Hampers Idul Fitri', 'SNK-291', 'c8', 'Paket Hampers', 28, 200000, 320000, 300000, 280000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p292', 'Paket Hampers Idul Adha', 'SNK-292', 'c8', 'Paket Hampers', 24, 190000, 300000, 280000, 260000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p293', 'Paket Snack Rapat', 'SNK-293', 'c8', 'Paket Hampers', 48, 85000, 140000, 130000, 120000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p294', 'Paket Snack Gathering', 'SNK-294', 'c8', 'Paket Hampers', 35, 110000, 180000, 170000, 160000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p295', 'Paket Snack Seminar', 'SNK-295', 'c8', 'Paket Hampers', 42, 95000, 155000, 145000, 135000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p296', 'Paket Premium A', 'SNK-296', 'c8', 'Paket Hampers', 15, 300000, 480000, 455000, 430000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p297', 'Paket Premium B', 'SNK-297', 'c8', 'Paket Hampers', 12, 350000, 550000, 520000, 490000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p298', 'Keripik Teri \"Medan\"', 'SNK-298', 'c1', 'Keripik & Kerupuk', 62, 18000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p299', 'Keripik Teri \"Balado\"', 'SNK-299', 'c1', 'Keripik & Kerupuk', 58, 19000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p3', 'Keripik Kaca \"Beling Pedas\"', 'SNK-003', 'c1', 'Keripik & Kerupuk', 200, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p30', 'Basreng \"Crispy Bawang\"', 'SNK-030', 'c2', 'Basreng & Seblak', 92, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p300', 'Keripik Teri \"Pedas Manis\"', 'SNK-300', 'c1', 'Keripik & Kerupuk', 65, 18500, 31000, 29000, 27000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p301', 'Rempeyek Udang \"Rebon\"', 'SNK-301', 'c1', 'Keripik & Kerupuk', 88, 12000, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p302', 'Rempeyek Bayam \"Crispy\"', 'SNK-302', 'c1', 'Keripik & Kerupuk', 95, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p303', 'Rempeyek Ikan Teri \"Special\"', 'SNK-303', 'c1', 'Keripik & Kerupuk', 72, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p304', 'Opak Bakar \"Manis\"', 'SNK-304', 'c1', 'Keripik & Kerupuk', 78, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p305', 'Opak Kulit \"Sambal\"', 'SNK-305', 'c1', 'Keripik & Kerupuk', 85, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p306', 'Intip Goreng \"Original\"', 'SNK-306', 'c1', 'Keripik & Kerupuk', 92, 7500, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p307', 'Intip Goreng \"Balado\"', 'SNK-307', 'c1', 'Keripik & Kerupuk', 88, 8000, 14500, 13500, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p308', 'Kerupuk Rambak \"Original\"', 'SNK-308', 'c1', 'Keripik & Kerupuk', 105, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p309', 'Kerupuk Amplang \"Ikan\"', 'SNK-309', 'c1', 'Keripik & Kerupuk', 112, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p31', 'Basreng \"Balado Manis\"', 'SNK-031', 'c2', 'Basreng & Seblak', 78, 12200, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p310', 'Kerupuk Mlarat \"Original\"', 'SNK-310', 'c1', 'Keripik & Kerupuk', 118, 6500, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p311', 'Basreng \"Ayam Geprek\"', 'SNK-311', 'c2', 'Basreng & Seblak', 102, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p312', 'Basreng \"Sapi Lada\"', 'SNK-312', 'c2', 'Basreng & Seblak', 95, 14000, 23000, 21500, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p313', 'Seblak \"Level 15\"', 'SNK-313', 'c2', 'Basreng & Seblak', 68, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p314', 'Seblak \"Keju Mozarella\"', 'SNK-314', 'c2', 'Basreng & Seblak', 75, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p315', 'Cireng \"Isi Saus\"', 'SNK-315', 'c2', 'Basreng & Seblak', 88, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p316', 'Cimol \"Isi Coklat\"', 'SNK-316', 'c2', 'Basreng & Seblak', 92, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p317', 'Cilok \"Kuah Sambal\"', 'SNK-317', 'c2', 'Basreng & Seblak', 85, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p318', 'Makaroni \"Pedas Thailand\"', 'SNK-318', 'c3', 'Makaroni & Mie Lidi', 205, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p319', 'Makaroni \"Kari Pedas\"', 'SNK-319', 'c3', 'Makaroni & Mie Lidi', 195, 5300, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p32', 'Basreng \"Jagung Bakar\"', 'SNK-032', 'c2', 'Basreng & Seblak', 68, 12800, 20500, 19000, 17500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p320', 'Mie Lidi \"Tom Yum\"', 'SNK-320', 'c3', 'Makaroni & Mie Lidi', 178, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p321', 'Mie Lidi \"Kimchi\"', 'SNK-321', 'c3', 'Makaroni & Mie Lidi', 165, 7200, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p322', 'Stick Jagung \"Manis\"', 'SNK-322', 'c3', 'Makaroni & Mie Lidi', 148, 6500, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p323', 'Stick Bayam \"Crispy\"', 'SNK-323', 'c3', 'Makaroni & Mie Lidi', 135, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p324', 'Kacang Ijo \"Kupas Crispy\"', 'SNK-324', 'c4', 'Kacang & Polong', 125, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p325', 'Kacang Kedelai \"Original\"', 'SNK-325', 'c4', 'Kacang & Polong', 138, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p326', 'Kacang Mente \"BBQ\"', 'SNK-326', 'c4', 'Kacang & Polong', 42, 50000, 78000, 73000, 68000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p327', 'Kacang Mente \"Pedas\"', 'SNK-327', 'c4', 'Kacang & Polong', 38, 52000, 80000, 75000, 70000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p328', 'Kacang Atom \"Pedas\"', 'SNK-328', 'c4', 'Kacang & Polong', 145, 8800, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p329', 'Kacang Atom \"BBQ\"', 'SNK-329', 'c4', 'Kacang & Polong', 152, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p33', 'Seblak Kering \"Pedas Manis\"', 'SNK-033', 'c2', 'Basreng & Seblak', 85, 9500, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p330', 'Kacang Shanghai \"Premium\"', 'SNK-330', 'c4', 'Kacang & Polong', 88, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p331', 'Kue Bangkit \"Pandan\"', 'SNK-331', 'c5', 'Kue Kering & Sus', 135, 18000, 29000, 27000, 25000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p332', 'Kue Bangkit \"Keju\"', 'SNK-332', 'c5', 'Kue Kering & Sus', 142, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p333', 'Kue Semprit \"Warna-Warni\"', 'SNK-333', 'c5', 'Kue Kering & Sus', 125, 19500, 31000, 29000, 27000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p334', 'Kue Semprit \"Green Tea\"', 'SNK-334', 'c5', 'Kue Kering & Sus', 118, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p335', 'Kue Sagu \"Coklat\"', 'SNK-335', 'c5', 'Kue Kering & Sus', 148, 18000, 29000, 27000, 25000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p336', 'Kue Sagu \"Pandan\"', 'SNK-336', 'c5', 'Kue Kering & Sus', 155, 17500, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p337', 'Brownies \"Panggang\"', 'SNK-337', 'c5', 'Kue Kering & Sus', 52, 30000, 48000, 45000, 42000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p338', 'Brownies \"Coklat Kacang\"', 'SNK-338', 'c5', 'Kue Kering & Sus', 48, 32000, 50000, 47000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p339', 'Pie Susu \"Bali\"', 'SNK-339', 'c5', 'Kue Kering & Sus', 75, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p34', 'Seblak Kering \"Keju\"', 'SNK-034', 'c2', 'Basreng & Seblak', 72, 10000, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p340', 'Pie Susu \"Coklat\"', 'SNK-340', 'c5', 'Kue Kering & Sus', 68, 23000, 36000, 34000, 31000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p341', 'Coklat Batangan \"Premium\"', 'SNK-341', 'c6', 'Coklat & Permen', 85, 32000, 50000, 47000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p342', 'Coklat Praline \"Mix\"', 'SNK-342', 'c6', 'Coklat & Permen', 62, 42000, 65000, 61000, 57000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p343', 'Permen Jelly \"Bear\"', 'SNK-343', 'c6', 'Coklat & Permen', 195, 13000, 22000, 20000, 18500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p344', 'Permen Jelly \"Worms\"', 'SNK-344', 'c6', 'Coklat & Permen', 185, 13500, 22500, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p345', 'Permen Kopi \"Coffee Joy\"', 'SNK-345', 'c6', 'Coklat & Permen', 175, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p346', 'Permen Susu \"Milkita\"', 'SNK-346', 'c6', 'Coklat & Permen', 168, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p347', 'Wafer Rolls \"Vanilla\"', 'SNK-347', 'c6', 'Coklat & Permen', 148, 14000, 23000, 21000, 19500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p348', 'Wafer Rolls \"Coklat\"', 'SNK-348', 'c6', 'Coklat & Permen', 152, 14500, 23500, 21500, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p349', 'Biskuit Marie \"Original\"', 'SNK-349', 'c6', 'Coklat & Permen', 188, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p35', 'Seblak Kering \"Original\"', 'SNK-035', 'c2', 'Basreng & Seblak', 95, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p350', 'Biskuit Kelapa \"Khongguan\"', 'SNK-350', 'c6', 'Coklat & Permen', 175, 13000, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p351', 'Air Mineral \"Le Minerale\"', 'SNK-351', 'c7', 'Minuman Kemasan', 285, 2000, 4000, 3500, 3000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p352', 'Air Mineral \"Ades\"', 'SNK-352', 'c7', 'Minuman Kemasan', 268, 1800, 3500, 3000, 2500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p353', 'Teh Gelas \"Sosro\"', 'SNK-353', 'c7', 'Minuman Kemasan', 215, 2500, 5000, 4500, 4000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p354', 'Teh Kotak \"Ultra Teh\"', 'SNK-354', 'c7', 'Minuman Kemasan', 195, 4000, 7500, 7000, 6500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p355', 'Jus Buah \"Buavita\"', 'SNK-355', 'c7', 'Minuman Kemasan', 142, 5500, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p356', 'Jus Jambu \"ABC\"', 'SNK-356', 'c7', 'Minuman Kemasan', 135, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p357', 'Kopi Susu \"Good Day\"', 'SNK-357', 'c7', 'Minuman Kemasan', 185, 2800, 5500, 5000, 4500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p358', 'Kopi Kapal Api \"RTD\"', 'SNK-358', 'c7', 'Minuman Kemasan', 175, 3000, 6000, 5500, 5000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p359', 'Energy Drink \"Kratingdaeng\"', 'SNK-359', 'c7', 'Minuman Kemasan', 118, 6500, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p36', 'Makaroni Pedas \"Level 1\"', 'SNK-036', 'c3', 'Makaroni & Mie Lidi', 310, 3500, 7000, 6500, 5500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p360', 'Energy Drink \"Extra Joss\"', 'SNK-360', 'c7', 'Minuman Kemasan', 125, 6000, 11500, 10500, 9500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p361', 'Paket Snack Pesta A', 'SNK-361', 'c8', 'Paket Hampers', 32, 130000, 210000, 195000, 180000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p362', 'Paket Snack Pesta B', 'SNK-362', 'c8', 'Paket Hampers', 28, 150000, 240000, 225000, 210000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p363', 'Paket Ultah Anak', 'SNK-363', 'c8', 'Paket Hampers', 45, 80000, 135000, 125000, 115000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p364', 'Paket Snack Box A', 'SNK-364', 'c8', 'Paket Hampers', 58, 65000, 110000, 100000, 90000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p365', 'Paket Snack Box B', 'SNK-365', 'c8', 'Paket Hampers', 52, 70000, 115000, 105000, 95000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p366', 'Paket Kue Kering A', 'SNK-366', 'c8', 'Paket Hampers', 25, 180000, 290000, 270000, 250000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p367', 'Paket Kue Kering B', 'SNK-367', 'c8', 'Paket Hampers', 20, 220000, 350000, 330000, 310000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p368', 'Keripik Mawar \"Pedas\"', 'SNK-368', 'c1', 'Keripik & Kerupuk', 132, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p369', 'Keripik Mawar \"Original\"', 'SNK-369', 'c1', 'Keripik & Kerupuk', 145, 6800, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p37', 'Makaroni Pedas \"Level 3\"', 'SNK-037', 'c3', 'Makaroni & Mie Lidi', 285, 4200, 8500, 7500, 6500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p370', 'Tortilla Chips \"Original\"', 'SNK-370', 'c1', 'Keripik & Kerupuk', 98, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p371', 'Tortilla Chips \"Nacho Cheese\"', 'SNK-371', 'c1', 'Keripik & Kerupuk', 92, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p372', 'Popcorn \"Caramel\"', 'SNK-372', 'c1', 'Keripik & Kerupuk', 118, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p373', 'Popcorn \"Butter\"', 'SNK-373', 'c1', 'Keripik & Kerupuk', 125, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p374', 'Popcorn \"BBQ\"', 'SNK-374', 'c1', 'Keripik & Kerupuk', 112, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p375', 'Keripik Pedas \"Chitato\"', 'SNK-375', 'c1', 'Keripik & Kerupuk', 158, 9000, 16500, 15000, 13500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');
INSERT INTO `products` (`id`, `name`, `sku`, `categoryId`, `categoryName`, `stock`, `hpp`, `priceRetail`, `priceGeneral`, `priceWholesale`, `pricePromo`, `image`, `createdAt`, `updatedAt`) VALUES
('p376', 'Keripik \"Lays Original\"', 'SNK-376', 'c1', 'Keripik & Kerupuk', 145, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p377', 'Keripik \"Qtela BBQ\"', 'SNK-377', 'c1', 'Keripik & Kerupuk', 135, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p378', 'Basreng \"Level 0\"', 'SNK-378', 'c2', 'Basreng & Seblak', 145, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p379', 'Basreng \"Mix Flavor\"', 'SNK-379', 'c2', 'Basreng & Seblak', 132, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p38', 'Makaroni \"BBQ Smoky\"', 'SNK-038', 'c3', 'Makaroni & Mie Lidi', 195, 5200, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p380', 'Seblak \"Rainbow Pedas\"', 'SNK-380', 'c2', 'Basreng & Seblak', 78, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p381', 'Seblak \"Isi Bakso\"', 'SNK-381', 'c2', 'Basreng & Seblak', 85, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p382', 'Cireng \"Bumbu Sunda\"', 'SNK-382', 'c2', 'Basreng & Seblak', 95, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p383', 'Cimol \"Isi Keju\"', 'SNK-383', 'c2', 'Basreng & Seblak', 102, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p384', 'Cilok \"Mix Size\"', 'SNK-384', 'c2', 'Basreng & Seblak', 88, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p385', 'Misro Crispy \"Original\"', 'SNK-385', 'c2', 'Basreng & Seblak', 72, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p386', 'Makaroni \"Pedas Korea\"', 'SNK-386', 'c3', 'Makaroni & Mie Lidi', 218, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p387', 'Makaroni \"Saus Tiram\"', 'SNK-387', 'c3', 'Makaroni & Mie Lidi', 202, 5200, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p388', 'Makaroni \"Rasa Tauco\"', 'SNK-388', 'c3', 'Makaroni & Mie Lidi', 195, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p389', 'Mie Lidi \"Sapi Panggang\"', 'SNK-389', 'c3', 'Makaroni & Mie Lidi', 185, 6800, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p39', 'Makaroni \"Bawang Jagung\"', 'SNK-039', 'c3', 'Makaroni & Mie Lidi', 220, 4800, 9500, 8500, 7500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p390', 'Mie Lidi \"Jagung Bakar\"', 'SNK-390', 'c3', 'Makaroni & Mie Lidi', 172, 6500, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p391', 'Stick Mix \"Premium\"', 'SNK-391', 'c3', 'Makaroni & Mie Lidi', 155, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p392', 'Kerupuk Bawang \"Super\"', 'SNK-392', 'c3', 'Makaroni & Mie Lidi', 165, 6500, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p393', 'Kerupuk Ikan \"Premium\"', 'SNK-393', 'c1', 'Keripik & Kerupuk', 78, 17000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p394', 'Kerupuk Palembang \"Original\"', 'SNK-394', 'c1', 'Keripik & Kerupuk', 125, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p395', 'Kacang Sukro \"Pedas\"', 'SNK-395', 'c4', 'Kacang & Polong', 128, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p396', 'Kacang Sukro \"Manis\"', 'SNK-396', 'c4', 'Kacang & Polong', 135, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p397', 'Kacang Medan \"Original\"', 'SNK-397', 'c4', 'Kacang & Polong', 142, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p398', 'Kacang Medan \"Pedas\"', 'SNK-398', 'c4', 'Kacang & Polong', 138, 12500, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p399', 'Kacang China \"Asin\"', 'SNK-399', 'c4', 'Kacang & Polong', 118, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p4', 'Basreng Stik Daun Jeruk \"Sultan\"', 'SNK-004', 'c2', 'Basreng & Seblak', 120, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p40', 'Mie Lidi \"Pedas Manis\"', 'SNK-040', 'c3', 'Makaroni & Mie Lidi', 165, 6200, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p400', 'Kacang Bogor \"Wrapping\"', 'SNK-400', 'c4', 'Kacang & Polong', 125, 14000, 23000, 21500, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p401', 'Nastar \"Special\"', 'SNK-401', 'c5', 'Kue Kering & Sus', 158, 26000, 42000, 39000, 36000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p402', 'Kastengel \"Special\"', 'SNK-402', 'c5', 'Kue Kering & Sus', 145, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p403', 'Putri Salju \"Special\"', 'SNK-403', 'c5', 'Kue Kering & Sus', 152, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p404', 'Lidah Kucing \"Special\"', 'SNK-404', 'c5', 'Kue Kering & Sus', 138, 23000, 37000, 35000, 32000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p405', 'Kue Kacang \"Special\"', 'SNK-405', 'c5', 'Kue Kering & Sus', 165, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p406', 'Cookies \"Peanut Butter\"', 'SNK-406', 'c5', 'Kue Kering & Sus', 102, 25000, 40000, 37000, 34000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p407', 'Cookies \"White Chocolate\"', 'SNK-407', 'c5', 'Kue Kering & Sus', 95, 26000, 42000, 39000, 36000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p408', 'Donat \"Gula Halus\"', 'SNK-408', 'c5', 'Kue Kering & Sus', 88, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p409', 'Donat \"Coklat Sprinkle\"', 'SNK-409', 'c5', 'Kue Kering & Sus', 92, 17000, 27000, 25000, 23000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p41', 'Mie Lidi \"BBQ\"', 'SNK-041', 'c3', 'Makaroni & Mie Lidi', 142, 6500, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p410', 'Roti Kering \"Vanilla\"', 'SNK-410', 'c5', 'Kue Kering & Sus', 115, 15000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p411', 'Coklat Truffle \"Premium\"', 'SNK-411', 'c6', 'Coklat & Permen', 45, 52000, 80000, 75000, 70000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p412', 'Coklat \"Nutella Jar\"', 'SNK-412', 'c6', 'Coklat & Permen', 38, 45000, 70000, 65000, 60000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p413', 'Permen \"Chupa Chups\"', 'SNK-413', 'c6', 'Coklat & Permen', 188, 9000, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p414', 'Permen \"Alpenliebe\"', 'SNK-414', 'c6', 'Coklat & Permen', 195, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p415', 'Permen \"Frutips\"', 'SNK-415', 'c6', 'Coklat & Permen', 175, 8500, 15500, 14000, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p416', 'Wafer Cube \"Vanilla\"', 'SNK-416', 'c6', 'Coklat & Permen', 162, 13000, 22000, 20000, 18500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p417', 'Wafer Cube \"Coklat\"', 'SNK-417', 'c6', 'Coklat & Permen', 168, 13500, 22500, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p418', 'Biskuit Oreo \"Original\"', 'SNK-418', 'c6', 'Coklat & Permen', 145, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p419', 'Biskuit Roma \"Kelapa\"', 'SNK-419', 'c6', 'Coklat & Permen', 158, 14000, 23000, 21000, 19500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p42', 'Mie Lidi \"Keju\"', 'SNK-042', 'c3', 'Makaroni & Mie Lidi', 158, 6800, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p420', 'Biskuit \"Good Time\"', 'SNK-420', 'c6', 'Coklat & Permen', 152, 15000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p421', 'Susu Bear Brand \"Kaleng\"', 'SNK-421', 'c7', 'Minuman Kemasan', 95, 12000, 22000, 20000, 18500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p422', 'Susu Dancow \"Sachet\"', 'SNK-422', 'c7', 'Minuman Kemasan', 195, 3000, 6000, 5500, 5000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p423', 'Susu Bendera \"Kotak\"', 'SNK-423', 'c7', 'Minuman Kemasan', 155, 4500, 8500, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p424', 'Paket Lebaran Premium', 'SNK-424', 'c8', 'Paket Hampers', 15, 280000, 450000, 425000, 400000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p425', 'Paket Natal Premium', 'SNK-425', 'c8', 'Paket Hampers', 12, 300000, 480000, 455000, 430000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p426', 'Paket Corporate A', 'SNK-426', 'c8', 'Paket Hampers', 22, 200000, 320000, 300000, 280000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p427', 'Paket Corporate B', 'SNK-427', 'c8', 'Paket Hampers', 18, 250000, 400000, 380000, 360000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p428', 'Keripik Rumput Laut \"Crispy\"', 'SNK-428', 'c1', 'Keripik & Kerupuk', 102, 12000, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p429', 'Keripik Rumput Laut \"Pedas\"', 'SNK-429', 'c1', 'Keripik & Kerupuk', 95, 12500, 21500, 20000, 18500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p43', 'Kacang Telur \"Renyah\"', 'SNK-043', 'c4', 'Kacang & Polong', 90, 13000, 22000, 20000, 18500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p430', 'Keripik Udang \"Asli\"', 'SNK-430', 'c1', 'Keripik & Kerupuk', 78, 16000, 27000, 25000, 23000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p431', 'Keripik Cumi \"Pedas\"', 'SNK-431', 'c1', 'Keripik & Kerupuk', 68, 18000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p432', 'Keripik Sotong \"Original\"', 'SNK-432', 'c1', 'Keripik & Kerupuk', 62, 19000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p433', 'Dendeng Balado \"Crispy\"', 'SNK-433', 'c1', 'Keripik & Kerupuk', 48, 35000, 55000, 52000, 48000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p434', 'Abon Sapi \"Premium\"', 'SNK-434', 'c1', 'Keripik & Kerupuk', 42, 48000, 75000, 70000, 65000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p435', 'Abon Ayam \"Pedas\"', 'SNK-435', 'c1', 'Keripik & Kerupuk', 45, 38000, 60000, 56000, 52000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p436', 'Basreng \"Premium Mix\"', 'SNK-436', 'c2', 'Basreng & Seblak', 118, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p437', 'Basreng \"Jumbo Size\"', 'SNK-437', 'c2', 'Basreng & Seblak', 88, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p438', 'Seblak \"Jumbo Pedas\"', 'SNK-438', 'c2', 'Basreng & Seblak', 72, 13000, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p439', 'Cireng \"Jumbo Isi\"', 'SNK-439', 'c2', 'Basreng & Seblak', 85, 14000, 23000, 21500, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p44', 'Kacang Tanah \"Goreng Asin\"', 'SNK-044', 'c4', 'Kacang & Polong', 125, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p440', 'Cimol \"Aneka Rasa\"', 'SNK-440', 'c2', 'Basreng & Seblak', 98, 12500, 21000, 19500, 18000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p441', 'Makaroni \"Mix Pedas\"', 'SNK-441', 'c3', 'Makaroni & Mie Lidi', 235, 5800, 11500, 10500, 9500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p442', 'Makaroni \"Rainbow\"', 'SNK-442', 'c3', 'Makaroni & Mie Lidi', 218, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p443', 'Mie Lidi \"Mix 3 Rasa\"', 'SNK-443', 'c3', 'Makaroni & Mie Lidi', 192, 7500, 14500, 13500, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p444', 'Stick \"Aneka Bentuk\"', 'SNK-444', 'c3', 'Makaroni & Mie Lidi', 168, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p445', 'Kacang Mix \"Premium 5 Jenis\"', 'SNK-445', 'c4', 'Kacang & Polong', 65, 35000, 55000, 52000, 48000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p446', 'Kacang Mix \"Premium 7 Jenis\"', 'SNK-446', 'c4', 'Kacang & Polong', 48, 48000, 75000, 70000, 65000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p447', 'Kacang \"Super Mix\"', 'SNK-447', 'c4', 'Kacang & Polong', 55, 42000, 65000, 61000, 57000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p448', 'Kacang \"Party Mix\"', 'SNK-448', 'c4', 'Kacang & Polong', 72, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p449', 'Kue Lebaran Mix A', 'SNK-449', 'c5', 'Kue Kering & Sus', 38, 180000, 290000, 270000, 250000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p45', 'Kacang Mete \"Premium\"', 'SNK-045', 'c4', 'Kacang & Polong', 35, 45000, 70000, 65000, 60000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p450', 'Kue Lebaran Mix B', 'SNK-450', 'c5', 'Kue Kering & Sus', 32, 220000, 350000, 330000, 310000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p451', 'Kue Natal Mix A', 'SNK-451', 'c5', 'Kue Kering & Sus', 28, 190000, 300000, 280000, 260000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p452', 'Kue Natal Mix B', 'SNK-452', 'c5', 'Kue Kering & Sus', 25, 230000, 370000, 350000, 330000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p453', 'Kue Premium Assorted', 'SNK-453', 'c5', 'Kue Kering & Sus', 42, 160000, 260000, 245000, 230000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p454', 'Coklat Premium Box', 'SNK-454', 'c6', 'Coklat & Permen', 35, 80000, 125000, 118000, 110000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p455', 'Coklat Assorted \"Import\"', 'SNK-455', 'c6', 'Coklat & Permen', 28, 95000, 150000, 142000, 135000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p456', 'Permen Mix \"Party\"', 'SNK-456', 'c6', 'Coklat & Permen', 125, 18000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p457', 'Permen Mix \"Kids\"', 'SNK-457', 'c6', 'Coklat & Permen', 138, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p458', 'Wafer Assorted \"Premium\"', 'SNK-458', 'c6', 'Coklat & Permen', 95, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p459', 'Biskuit Mix \"Special\"', 'SNK-459', 'c6', 'Coklat & Permen', 108, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p46', 'Kacang Almond \"Panggang\"', 'SNK-046', 'c4', 'Kacang & Polong', 28, 55000, 85000, 80000, 75000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p460', 'Minuman Paket A \"5 Botol\"', 'SNK-460', 'c7', 'Minuman Kemasan', 85, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p461', 'Minuman Paket B \"10 Botol\"', 'SNK-461', 'c7', 'Minuman Kemasan', 65, 42000, 65000, 61000, 57000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p462', 'Paket Snack Mix A', 'SNK-462', 'c8', 'Paket Hampers', 45, 95000, 155000, 145000, 135000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p463', 'Paket Snack Mix B', 'SNK-463', 'c8', 'Paket Hampers', 38, 120000, 195000, 185000, 175000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p464', 'Paket Snack Mix C', 'SNK-464', 'c8', 'Paket Hampers', 32, 150000, 240000, 225000, 210000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p465', 'Paket Family A', 'SNK-465', 'c8', 'Paket Hampers', 28, 180000, 290000, 270000, 250000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p466', 'Paket Family B', 'SNK-466', 'c8', 'Paket Hampers', 25, 220000, 350000, 330000, 310000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p467', 'Keripik \"Sampler 5 Rasa\"', 'SNK-467', 'c1', 'Keripik & Kerupuk', 88, 25000, 40000, 37000, 34000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p468', 'Keripik \"Sampler 10 Rasa\"', 'SNK-468', 'c1', 'Keripik & Kerupuk', 65, 48000, 75000, 70000, 65000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p469', 'Kerupuk \"Sampler Mix\"', 'SNK-469', 'c1', 'Keripik & Kerupuk', 95, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p47', 'Kacang Kapri \"Wasabi\"', 'SNK-047', 'c4', 'Kacang & Polong', 62, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p470', 'Basreng \"Sampler 5 Level\"', 'SNK-470', 'c2', 'Basreng & Seblak', 78, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p471', 'Seblak \"Sampler Mix\"', 'SNK-471', 'c2', 'Basreng & Seblak', 68, 26000, 42000, 39000, 36000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p472', 'Makaroni \"Sampler 10 Rasa\"', 'SNK-472', 'c3', 'Makaroni & Mie Lidi', 125, 32000, 50000, 47000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p473', 'Mie Lidi \"Sampler Mix\"', 'SNK-473', 'c3', 'Makaroni & Mie Lidi', 112, 30000, 48000, 45000, 42000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p474', 'Kacang \"Sampler Premium\"', 'SNK-474', 'c4', 'Kacang & Polong', 58, 55000, 85000, 80000, 75000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p475', 'Kue Kering \"Sampler 8 Jenis\"', 'SNK-475', 'c5', 'Kue Kering & Sus', 48, 120000, 195000, 185000, 175000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p476', 'Kue Kering \"Sampler 12 Jenis\"', 'SNK-476', 'c5', 'Kue Kering & Sus', 35, 180000, 290000, 270000, 250000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p477', 'Coklat \"Sampler Import\"', 'SNK-477', 'c6', 'Coklat & Permen', 42, 75000, 120000, 113000, 105000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p478', 'Permen \"Sampler World\"', 'SNK-478', 'c6', 'Coklat & Permen', 88, 32000, 50000, 47000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p479', 'Paket Ultimate A', 'SNK-479', 'c8', 'Paket Hampers', 15, 350000, 550000, 520000, 490000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p48', 'Kacang Polong \"Pedas Gurih\"', 'SNK-048', 'c4', 'Kacang & Polong', 98, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p480', 'Paket Ultimate B', 'SNK-480', 'c8', 'Paket Hampers', 12, 400000, 630000, 600000, 570000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p481', 'Paket VIP A', 'SNK-481', 'c8', 'Paket Hampers', 10, 500000, 780000, 750000, 720000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p482', 'Paket VIP B', 'SNK-482', 'c8', 'Paket Hampers', 8, 600000, 950000, 920000, 890000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p483', 'Keripik \"Special Edition\"', 'SNK-483', 'c1', 'Keripik & Kerupuk', 58, 32000, 50000, 47000, 44000, 48000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p484', 'Basreng \"Special Edition\"', 'SNK-484', 'c2', 'Basreng & Seblak', 52, 35000, 55000, 52000, 48000, 50000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p485', 'Makaroni \"Special Edition\"', 'SNK-485', 'c3', 'Makaroni & Mie Lidi', 95, 15000, 25000, 23000, 21000, 22000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p486', 'Kacang \"Special Edition\"', 'SNK-486', 'c4', 'Kacang & Polong', 72, 42000, 65000, 61000, 57000, 60000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p487', 'Kue \"Special Edition\"', 'SNK-487', 'c5', 'Kue Kering & Sus', 45, 85000, 135000, 128000, 120000, 125000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p488', 'Coklat \"Special Edition\"', 'SNK-488', 'c6', 'Coklat & Permen', 38, 65000, 100000, 95000, 90000, 92000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p489', 'Snack Box Premium A', 'SNK-489', 'c8', 'Paket Hampers', 55, 85000, 140000, 130000, 120000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p49', 'Kacang Bali \"Original\"', 'SNK-049', 'c4', 'Kacang & Polong', 110, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p490', 'Snack Box Premium B', 'SNK-490', 'c8', 'Paket Hampers', 48, 105000, 170000, 160000, 150000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p491', 'Snack Box Premium C', 'SNK-491', 'c8', 'Paket Hampers', 42, 125000, 200000, 190000, 180000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p492', 'Gift Box A', 'SNK-492', 'c8', 'Paket Hampers', 35, 150000, 240000, 225000, 210000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p493', 'Gift Box B', 'SNK-493', 'c8', 'Paket Hampers', 30, 180000, 290000, 270000, 250000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p494', 'Gift Box C', 'SNK-494', 'c8', 'Paket Hampers', 25, 220000, 350000, 330000, 310000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p495', 'Hampers Exclusive A', 'SNK-495', 'c8', 'Paket Hampers', 18, 280000, 450000, 425000, 400000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p496', 'Hampers Exclusive B', 'SNK-496', 'c8', 'Paket Hampers', 15, 350000, 550000, 520000, 490000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p497', 'Hampers Luxury A', 'SNK-497', 'c8', 'Paket Hampers', 10, 500000, 780000, 750000, 720000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p498', 'Hampers Luxury B', 'SNK-498', 'c8', 'Paket Hampers', 8, 650000, 1000000, 970000, 940000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p499', 'Hampers Royal A', 'SNK-499', 'c8', 'Paket Hampers', 5, 800000, 1250000, 1200000, 1150000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p5', 'Basreng Koin Original \"Gurih\"', 'SNK-005', 'c2', 'Basreng & Seblak', 90, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p50', 'Nastar \"Nanas Premium\"', 'SNK-050', 'c5', 'Kue Kering & Sus', 155, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p500', 'Hampers Royal B', 'SNK-500', 'c8', 'Paket Hampers', 3, 1000000, 1550000, 1500000, 1450000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p51', 'Kastengel \"Keju Edam\"', 'SNK-051', 'c5', 'Kue Kering & Sus', 140, 24000, 38000, 36000, 33000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p52', 'Putri Salju \"Lembut\"', 'SNK-052', 'c5', 'Kue Kering & Sus', 165, 20000, 32000, 30000, 28000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p53', 'Lidah Kucing \"Vanilla\"', 'SNK-053', 'c5', 'Kue Kering & Sus', 130, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p54', 'Kue Kacang \"Tradisional\"', 'SNK-054', 'c5', 'Kue Kering & Sus', 175, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p55', 'Sagu Keju \"Renyah\"', 'SNK-055', 'c5', 'Kue Kering & Sus', 148, 17000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p56', 'Semprit \"Wijen\"', 'SNK-056', 'c5', 'Kue Kering & Sus', 122, 18500, 29000, 27000, 25000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p57', 'Coklat Delfi \"Kiloan\"', 'SNK-057', 'c6', 'Coklat & Permen', 68, 28000, 45000, 42000, 39000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p58', 'Coklat Silverqueen \"Chunky Bar\"', 'SNK-058', 'c6', 'Coklat & Permen', 55, 32000, 50000, 47000, 44000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p59', 'Permen Karet \"Lotte\"', 'SNK-059', 'c6', 'Coklat & Permen', 145, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p6', 'Seblak Kering \"Mercon\"', 'SNK-006', 'c2', 'Basreng & Seblak', 60, 9000, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p60', 'Permen Toffee Kopiko', 'SNK-060', 'c6', 'Coklat & Permen', 190, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p61', 'Permen Lolipop \"Rainbow\"', 'SNK-061', 'c6', 'Coklat & Permen', 210, 8000, 15000, 13500, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p62', 'Wafer \"Tango Coklat\"', 'SNK-062', 'c6', 'Coklat & Permen', 165, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p63', 'Wafer Stick \"Astor\"', 'SNK-063', 'c6', 'Coklat & Permen', 152, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p64', 'Keripik Pedas \"Maicih Level 10\"', 'SNK-064', 'c1', 'Keripik & Kerupuk', 82, 11000, 20000, 18500, 17000, 19000, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p65', 'Keripik Pelangi \"Rainbow\"', 'SNK-065', 'c1', 'Keripik & Kerupuk', 115, 9000, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p66', 'Kerupuk Udang \"Super Besar\"', 'SNK-066', 'c1', 'Keripik & Kerupuk', 73, 14000, 24000, 22000, 20000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p67', 'Kerupuk Ikan \"Tenggiri\"', 'SNK-067', 'c1', 'Keripik & Kerupuk', 58, 16000, 26000, 24000, 22000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p68', 'Rengginang \"Lorjuk\"', 'SNK-068', 'c1', 'Keripik & Kerupuk', 48, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p69', 'Kerupuk Kampung \"Bawang\"', 'SNK-069', 'c1', 'Keripik & Kerupuk', 135, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p7', 'Makaroni Bantet \"Setan Level 5\"', 'SNK-007', 'c3', 'Makaroni & Mie Lidi', 300, 4000, 8000, 7000, 6000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p70', 'Cilok Crispy \"Original\"', 'SNK-070', 'c2', 'Basreng & Seblak', 105, 10000, 18000, 16500, 15000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p71', 'Cilok Crispy \"Pedas\"', 'SNK-071', 'c2', 'Basreng & Seblak', 88, 10500, 18500, 17000, 15500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p72', 'Cimol Krispi \"Rasa BBQ\"', 'SNK-072', 'c2', 'Basreng & Seblak', 92, 9500, 17000, 15500, 14000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p73', 'Cireng Crispy \"Bumbu Rujak\"', 'SNK-073', 'c2', 'Basreng & Seblak', 76, 11000, 19000, 17500, 16000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p74', 'Batagor Krispi \"Bandung\"', 'SNK-074', 'c2', 'Basreng & Seblak', 65, 13500, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p75', 'Makaroni \"Coklat Meses\"', 'SNK-075', 'c3', 'Makaroni & Mie Lidi', 125, 5500, 11000, 10000, 9000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p76', 'Makaroni \"Balado Ijo\"', 'SNK-076', 'c3', 'Makaroni & Mie Lidi', 168, 5200, 10500, 9500, 8500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p77', 'Makaroni \"Abon Sapi\"', 'SNK-077', 'c3', 'Makaroni & Mie Lidi', 95, 7000, 13500, 12500, 11500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p78', 'Stik Kentang \"Keju\"', 'SNK-078', 'c3', 'Makaroni & Mie Lidi', 112, 6500, 12500, 11500, 10500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p79', 'Stik Kentang \"Rumput Laut\"', 'SNK-079', 'c3', 'Makaroni & Mie Lidi', 103, 6800, 13000, 12000, 11000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p8', 'Makaroni Spiral \"Keju Premium\"', 'SNK-008', 'c3', 'Makaroni & Mie Lidi', 180, 5000, 10000, 9000, 8000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p80', 'Jamur Crispy \"Original\"', 'SNK-080', 'c3', 'Makaroni & Mie Lidi', 72, 8500, 16000, 14500, 13000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p81', 'Kedelai Jepang \"Premium\"', 'SNK-081', 'c4', 'Kacang & Polong', 85, 14000, 23000, 21000, 19500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p82', 'Kacang Koro \"Balado\"', 'SNK-082', 'c4', 'Kacang & Polong', 94, 11500, 19500, 18000, 16500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p83', 'Kacang Telur \"Wasabi\"', 'SNK-083', 'c4', 'Kacang & Polong', 77, 15000, 25000, 23000, 21000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p84', 'Kacang Disco \"Warna-Warni\"', 'SNK-084', 'c4', 'Kacang & Polong', 118, 12000, 20000, 18500, 17000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p85', 'Kacang Thailand \"Pedas Manis\"', 'SNK-085', 'c4', 'Kacang & Polong', 105, 13500, 22000, 20500, 19000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p86', 'Biscotti \"Almond\"', 'SNK-086', 'c5', 'Kue Kering & Sus', 95, 25000, 40000, 38000, 35000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p87', 'Cookies Chocochip \"Jumbo\"', 'SNK-087', 'c5', 'Kue Kering & Sus', 110, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p88', 'Kue Sagu \"Keju Premium\"', 'SNK-088', 'c5', 'Kue Kering & Sus', 125, 19000, 30000, 28000, 26000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p89', 'Kaasstengels \"Holland\"', 'SNK-089', 'c5', 'Kue Kering & Sus', 88, 26000, 42000, 40000, 37000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p9', 'Mie Lidi \"Si Umang 90an\"', 'SNK-009', 'c3', 'Makaroni & Mie Lidi', 150, 6000, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p90', 'Kue Bangkit \"Sagu\"', 'SNK-090', 'c5', 'Kue Kering & Sus', 145, 17000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p91', 'Pilus \"Garuda Rasa Keju\"', 'SNK-091', 'c3', 'Makaroni & Mie Lidi', 205, 7500, 14000, 13000, 12000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p92', 'Pilus \"Pedas Nian\"', 'SNK-092', 'c3', 'Makaroni & Mie Lidi', 188, 7800, 14500, 13500, 12500, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p93', 'Coklat Koin \"Mix Flavour\"', 'SNK-093', 'c6', 'Coklat & Permen', 128, 22000, 35000, 33000, 30000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p94', 'Marshmallow \"Premium\"', 'SNK-094', 'c6', 'Coklat & Permen', 95, 18000, 28000, 26000, 24000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p95', 'Jelly Drink \"Okky\"', 'SNK-095', 'c7', 'Minuman Kemasan', 240, 3500, 7000, 6500, 6000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p96', 'Teh Pucuk Harum', 'SNK-096', 'c7', 'Minuman Kemasan', 180, 4000, 8000, 7500, 7000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p97', 'Pocari Sweat \"Botol\"', 'SNK-097', 'c7', 'Minuman Kemasan', 120, 6500, 12000, 11000, 10000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p98', 'Aqua Gelas 240ml', 'SNK-098', 'c7', 'Minuman Kemasan', 350, 1500, 3000, 2500, 2000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('p99', 'Good Day Cappuccino', 'SNK-099', 'c7', 'Minuman Kemasan', 165, 2500, 5000, 4500, 4000, NULL, NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');

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
  `updatedAt` datetime NOT NULL,
  `originalPurchaseId` varchar(255) DEFAULT NULL
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
  `showJargon` tinyint(1) DEFAULT NULL,
  `showBank` tinyint(1) DEFAULT NULL,
  `printerType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
('sup10', 'Distributor Cemilan Jaya (Bekasi)', '0825-9999-0000', 'Kawasan Industri MM2100, Bekasi', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup11', 'CV. Kue Enak Pontianak', '0826-1111-2222', 'Jl. Gajah Mada No. 88, Pontianak', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup12', 'UD. Keripik Mentah (Lampung)', '0827-3333-4444', 'Bandar Lampung, Jl. Raden Intan', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup13', 'Pabrik Wafer \"Crunchy\" (Tangerang)', '0828-5555-6666', 'Kawasan Industri Balaraja', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup14', 'PT Coklat Indonesia (Sidoarjo)', '0829-7777-8888', 'Kawasan Industri SIER, Sidoarjo', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup15', 'CV. Mie Lidi Mantap (Garut)', '0811-9999-0000', 'Jl. Raya Garut-Tasik KM 5', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup16', 'UD. Pilus Pedas (Yogyakarta)', '0812-1111-2222', 'Jl. Malioboro No. 45, Jogja', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup17', 'Grosir Keripik Pisang (Kediri)', '0813-3333-4444', 'Pasar Gede Kediri Lt. 2', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup18', 'Pabrik Kacang Medan \"Premium\"', '0814-5555-6666', 'Jl. Gatot Subroto, Medan', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup19', 'CV. Cemilan Solo Raya', '0815-7777-8888', 'Jl. Slamet Riyadi, Solo', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup2', 'CV. Aneka Rasa Nusantara (Jakarta)', '0813-4444-5555', 'Kawasan Industri Pulogadung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup20', 'PT Snack Makassar Food', '0816-9999-0000', 'Kawasan Industri Makassar', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup21', 'UD. Kerupuk Palembang Asli', '0817-1111-2222', 'Jl. Sudirman, Palembang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup22', 'Distributor Snack Bali \"Dewata\"', '0818-3333-4444', 'Jl. Raya Kuta, Badung, Bali', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup23', 'CV. Keripik Aceh Sejahtera', '0819-5555-6666', 'Jl. T Nyak Arief, Banda Aceh', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup24', 'Pabrik Makaroni \"Spiral\" (Depok)', '0820-7777-8888', 'Jl. Margonda Raya, Depok', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup25', 'UD. Basreng Cirebon \"Pedas\"', '0821-9999-0000', 'Jl. Kesambi, Cirebon', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup26', 'PT Food Cemilan Nusantara (Cikarang)', '0822-1111-2222', 'Jababeka Industrial Estate', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup27', 'CV. Jajanan Purwokerto', '0823-3333-4444', 'Jl. Jend Sudirman, Purwokerto', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup28', 'Grosir Kue Kering \"Bandung Raya\"', '0824-5555-6666', 'Jl. Soekarno Hatta, Bandung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup29', 'Pabrik Stick \"Crispy\" (Karawang)', '0825-7777-8888', 'Kawasan Industri Karawang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup3', 'Agen Keripik \"Bu Susi\" (Malang)', '0856-7777-8888', 'Jl. Apel No. 88, Batu, Malang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup30', 'UD. Rempeyek Jawa (Klaten)', '0826-9999-0000', 'Pasar Klaten Utara', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup31', 'CV. Keripik Tempe Malang', '0827-1111-2222', 'Jl. Tugu Malang No. 50', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup32', 'Distributor Cemilan \"Harapan Jaya\"', '0828-3333-4444', 'Ruko BSD Serpong, Tangerang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup33', 'PT Snack Indonesia Prima (Jakarta)', '0829-5555-6666', 'Kawasan Industri Pulo Gadung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup34', 'UD. Opak Jogja \"Original\"', '0811-7777-8888', 'Jl. Kaliurang KM 8, Sleman', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup35', 'Pabrik Biskuit \"Golden\" (Surabaya)', '0812-9999-0000', 'Kawasan Industri Rungkut', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup36', 'CV. Keripik Singkong Lampung', '0813-1111-2222', 'Jl. Ryacudu, Bandar Lampung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup37', 'Grosir Permen \"Manis Jaya\" (Surabaya)', '0814-3333-4444', 'Pasar Atom Surabaya', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup38', 'UD. Dendeng Balado (Padang)', '0815-5555-6666', 'Jl. Veteran, Padang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup39', 'PT Kacang Toll (Pekanbaru)', '0816-7777-8888', 'Jl. Sudirman, Pekanbaru', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup4', 'Grosir Cemilan \"Berkah\" (Surabaya)', '0819-0000-1111', 'Pasar Turi Baru Lt. 1', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup40', 'CV. Sale Pisang Ambon', '0817-9999-0000', 'Jl. AY Patty, Ambon', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup41', 'Distributor Wafer \"Crunchy King\"', '0818-1111-2222', 'Ruko Summarecon Bekasi', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup42', 'Pabrik Keripik Buah (Bogor)', '0819-3333-4444', 'Jl. Raya Tajur, Bogor', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup43', 'UD. Cireng Bumbu (Sukabumi)', '0820-5555-6666', 'Jl. Bhayangkara, Sukabumi', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup44', 'CV. Emping Melinjo (Banjar)', '0821-7777-8888', 'Jl. Raya Banjar-Ciamis', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup45', 'PT Coklat Deluxe (Semarang)', '0822-9999-0000', 'Kawasan Industri Terboyo', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup46', 'Grosir Snack \"Murah Meriah\" (Solo)', '0823-1111-2222', 'Pasar Klewer Solo', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup47', 'UD. Kacang Shanghai (Salatiga)', '0824-3333-4444', 'Jl. Jend Sudirman, Salatiga', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup48', 'Pabrik Seblak \"Mantap\" (Bandung)', '0825-5555-6666', 'Jl. Cicaheum, Bandung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup49', 'CV. Keripik Pare Magelang', '0826-7777-8888', 'Jl. Magelang-Jogja KM 5', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup5', 'Pabrik Makaroni \"Ngehe\" (Tasik)', '0822-3333-9999', 'Tasikmalaya Kota', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup50', 'PT Minuman Kemasan Indonesia', '0827-9999-0000', 'Kawasan Industri Cikupa, Tangerang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup6', 'PT Keripik Nusantara (Bogor)', '0821-1111-2222', 'Kawasan Industri Cibinong, Bogor', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup7', 'CV. Basreng Bandung Jaya', '0822-3333-4444', 'Jl. Cihampelas No. 120, Bandung', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup8', 'UD. Makmur Snack (Semarang)', '0823-5555-6666', 'Pasar Johar Blok C, Semarang', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02'),
('sup9', 'Pabrik Kacang \"Garuda KW\" (Pati)', '0824-7777-8888', 'Jl. Raya Pati-Kudus KM 10', NULL, '2025-11-21 03:21:02', '2025-11-21 03:21:02');

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
('admin_id', 'Administrator', 'admin', '$2b$10$/G1LVJ0rrpGXYlII4afPVuWGyRFU/l7/j6xih.PHyjGWxz4tDti/y', 'OWNER', NULL, '2025-11-25 10:47:56', '2025-11-25 11:34:40'),
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
