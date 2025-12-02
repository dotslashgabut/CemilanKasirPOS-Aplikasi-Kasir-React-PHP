# Security Audit Report

## Overview
This document outlines the security audit findings for the Cemilan KasirPOS application.
**Note:** The application fully utilizes the **PHP Native backend** as the primary server.

**Last Updated:** 2025-12-02 (Security Fixes Applied)

## Status Summary

| ID | Component | Finding | Severity | Status |
|----|-----------|---------|----------|--------|
| P1 | PHP | Hardcoded Credentials | **High** | 🟢 Resolved |
| P2 | PHP | Sensitive Data Exposure | **High** | 🟢 Resolved |
| P3 | PHP | Rate Limiting Race Condition | **Medium** | 🟢 Resolved |
| P4 | PHP | CORS Configuration | **Medium** | 🟢 Resolved |
| P5 | PHP | Input Sanitization & XSS | **Medium** | 🟢 Resolved |
| P6 | PHP | Legacy Password Support | **Low** | 🟢 Resolved |
| P7 | PHP | File Permissions | **Medium** | 🟢 Resolved |
| P8 | PHP | HTTPS Enforcement | **Medium** | 🟢 Resolved |
| P9 | PHP | Batch Insert Validation Bypass | **Medium** | 🟢 Resolved |
| P10 | PHP | Weak Randomness (UUID) | **Low** | 🟢 Resolved |

## Detailed Findings

### PHP Backend (Primary)

*These findings apply to the `php_server` directory.*

#### P1. Hardcoded Credentials
- **Severity**: **High**
- **Status**: **Resolved**
- **Resolution**: 
    - `auth.php` now prioritizes `getenv('JWT_SECRET')`.
    - If `JWT_SECRET` is missing in production (debug off), a critical error is logged.
    - Default fallback is only used for development.

#### P2. Sensitive Data Exposure & Logging
- **Severity**: **High**
- **Status**: **Resolved**
- **Resolution**: 
    - `logic.php` now logs only IDs or errors, avoiding full PII payloads.
    - `.htaccess` now denies access to `.log` and `.json` files.

#### P3. Rate Limiting Race Condition
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**: 
    - `rate_limit.php` now uses `flock()` to ensure exclusive access to the JSON file during writes.

#### P4. CORS Configuration
- **Severity**: **Medium** (Production)
- **Status**: **Resolved**
- **Resolution**: 
    - `config.php` now checks for `ALLOWED_ORIGINS` environment variable.
    - If set, it only allows origins from that list.
    - Default `*` is used only if `ALLOWED_ORIGINS` is not set (Development fallback).

#### P5. Input Sanitization & XSS
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Description**: 
    - Backend API mengimplementasikan beberapa layer proteksi untuk mencegah XSS dan injection attacks.
- **Implementation**: 
    1. **String Sanitization**: `index.php` menggunakan `strip_tags()` untuk menghilangkan HTML/script tags dari semua string input (lines 149, 385, 447).
    2. **SQL Injection Prevention**: Semua query database menggunakan prepared statements dengan parameter binding.
    3. **Input Validation**: `validator.php` memvalidasi format input untuk username (regex alphanumeric), email (FILTER_VALIDATE_EMAIL), phone numbers (regex), dan numeric values.
    4. **Schema Filtering**: `filterDataBySchema()` memastikan hanya kolom yang diizinkan yang dapat diinsert/update ke database.
    5. **Column Name Validation**: Regex validation (`/^[a-zA-Z0-9_]+$/`) untuk mencegah SQL injection via column names (lines 163, 377, 453).
    6. **JSON API Architecture**: Backend hanya mengirim data JSON tanpa HTML rendering, sehingga XSS prevention di sisi output adalah tanggung jawab frontend React.
- **Note**: 
    - JWT disimpan di `localStorage` (client-side). Untuk security lebih baik, pertimbangkan `HttpOnly` cookies untuk mitigasi XSS token theft di masa depan.
    - Frontend React sudah otomatis escape HTML saat rendering, memberikan layer proteksi tambahan terhadap XSS.

#### P6. Legacy Password Support
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**: 
    - Plaintext password fallback has been removed from `login.php`. All passwords must be hashed with bcrypt (starting with `$2`).

#### P7. File Permissions & Structure
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**: 
    - `.htaccess` is configured to deny access to sensitive files (`.log`, `.json`, `.env`).

#### P8. HTTPS Enforcement
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - HSTS header logic in `config.php` has been uncommented and improved to only activate when `HTTPS` is detected.

#### P9. Batch Insert Validation Bypass
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - `index.php` now calls `validateInput($resource, $item)` inside the batch processing loop.
    - The entire batch process throws an exception if any item fails validation.

#### P10. Weak Randomness (UUID)
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**:
    - `logic.php` now uses `random_int()` instead of `mt_rand()` for UUID generation, providing cryptographically secure entropy.

## Action Plan

### ✅ Completed
All critical and medium security issues have been resolved. The PHP backend now implements comprehensive security measures including:
- Environment-based configuration with secure defaults
- Multi-layer input sanitization and validation
- SQL injection prevention via prepared statements
- Secure password hashing (bcrypt)
- Rate limiting with race condition protection
- Proper CORS configuration
- HTTPS enforcement
- File permission controls
- Cryptographically secure UUID generation

### 🔮 Future Enhancements
1. **HttpOnly Cookies for JWT**: Consider migrating from `localStorage` to `HttpOnly` cookies for better XSS attack mitigation.
2. **Content Security Policy (CSP)**: Implement CSP headers di frontend untuk additional layer of XSS protection.
3. **Regular Security Audits**: Maintain periodic security reviews as the application evolves.
4. **Dependency Updates**: Keep PHP and library dependencies up-to-date with security patches.

