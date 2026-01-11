# Security Audit Report

## Overview
This document outlines the security audit findings for the Cemilan KasirPOS application.
**Note:** The application fully utilizes the **PHP Native backend** as the primary server.

**Last Updated:** 2026-01-11 (Re-verification Audit)

## Status Summary

| ID | Component | Finding | Severity | Status |
|----|-----------|---------|----------|--------|
| P1 | PHP | Hardcoded Credentials | **High** | 🟢 Resolved (Verified) |
| P2 | PHP | Sensitive Data Exposure | **High** | 🟢 Resolved (Verified) |
| P3 | PHP | Rate Limiting Race Condition | **Medium** | 🟢 Resolved (Verified) |
| P4 | PHP | CORS Configuration | **Medium** | 🟢 Resolved (Verified) |
| P5 | PHP | Input Sanitization & XSS | **Medium** | 🟢 Resolved (Verified) |
| P6 | PHP | Legacy Password Support | **Low** | 🟢 Resolved (Verified) |
| P7 | PHP | File Permissions | **Medium** | 🟢 Resolved (Verified) |
| P8 | PHP | HTTPS Enforcement | **Medium** | 🟢 Resolved (Verified) |
| P9 | PHP | Batch Insert Validation Bypass | **Medium** | 🟢 Resolved (Verified) |
| P10 | PHP | Weak Randomness (UUID) | **Low** | 🟢 Resolved (Verified) |
| F1 | React/PHP | LocalStorage for Auth Tokens | **Medium** | 🟢 Resolved (Verified) |
| F2 | React | Weak Randomness Fallback | **Low** | 🟢 Resolved (Verified) |
| F3 | React/PHP | Client-Side ID Generation | **Low** | 🟢 Resolved (Verified) |
| F4 | React | Missing CSP Headers | **Medium** | 🟢 Resolved (Verified) |

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
    - `logic.php` updated to log only minimal info (Transaction IDs), removing detailed PII payloads from `php_error.log`.
    - `.htaccess` configured to deny HTTP access to `.log`, `.json`, and `.env` files.

#### P3. Rate Limiting Race Condition
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**: 
    - `rate_limit.php` now uses `flock($fp, LOCK_EX)` to ensure exclusive write access to `login_attempts.json`.
    - Implemented a "Fail Open" strategy: if the file cannot be locked, it allows access to prevent DoS.

#### P4. CORS Configuration
- **Severity**: **Medium** (Production)
- **Status**: **Resolved**
- **Resolution**: 
    - `config.php` now checks for `ALLOWED_ORIGINS` environment variable.
    - If set, it only allows origins from that list.
    - Default `*` is used only if `ALLOWED_ORIGINS` is not set (Development fallback).
    - Authentication supports `Access-Control-Allow-Credentials: true` for Cookies.

#### P5. Input Sanitization & XSS
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Description**: 
    - Backend API mengimplementasikan beberapa layer proteksi untuk mencegah XSS dan injection attacks.
- **Implementation**: 
    - **String Sanitization**: `index.php` menggunakan `strip_tags()` untuk menghilangkan HTML/script tags dari semua string input.
    - **SQL Injection Prevention**: Semua query database menggunakan prepared statements dengan parameter binding.
    - **Input Validation**: `validator.php` memvalidasi format input.
    - **Schema Filtering**: `filterDataBySchema()` memastikan hanya kolom yang diizinkan yang dapat diinsert/update.
    - **JSON API Architecture**: Backend hanya mengirim data JSON tanpa HTML rendering.

#### P6. Legacy Password Support
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**: 
    - Plaintext password fallback has been removed from `login.php`. All passwords must be hashed with bcrypt.

#### P7. File Permissions & Structure
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**: 
    - `.htaccess` is configured to deny access to sensitive files (`.log`, `.json`, `.env`).

#### P8. HTTPS Enforcement
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - HSTS header logic in `config.php` is enabled to force HTTPS connections.
    - Secure Cookie flag is automatically enabled if HTTPS is detected.

#### P9. Batch Insert Validation Bypass
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - `index.php` now calls `validateInput($resource, $item)` inside the batch processing loop.

#### P10. Weak Randomness (UUID)
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**:
    - `logic.php` now uses `random_int()` instead of `mt_rand()` for UUID generation.

### React Frontend & Full Stack Integration

*These findings apply to the `src` and `pages` directories and their integration with `php_server`.*

#### F1. LocalStorage for Auth Tokens
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - **HttpOnly Cookies Implemented**: Login endpoint now sets a secure, HttpOnly, SameSite=Lax cookie containing the JWT (`pos_token`).
    - **Frontend Update**: `api.ts` now uses `credentials: 'include'` to send cookies with every request.
    - **Storage Cleanup**: Frontend no longer saves the token in `localStorage`, eliminating the primary XSS token theft vector.
    - **Middleware**: PHP backend (`auth.php`) now validates auth via Cookie if the Authorization header is missing.
    - **Logout**: Added secure logout logic to clear the cookie.

#### F2. Weak Randomness Fallback
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**:
    - **Stronger Polyfill**: Updated `generateUUID` in `utils.ts` to use `crypto.getRandomValues()` (widely supported) instead of `Math.random()` when `crypto.randomUUID()` is unavailable.
    - **Warning**: A warning is now logged if no cryptographic source is available (unlikely in modern browsers).

#### F3. Client-Side ID Generation
- **Severity**: **Low**
- **Status**: **Resolved**
- **Resolution**:
    - **Server-Side Generation**: Backend (`index.php`) now automatically generates a robust UUID if an item is submitted without an ID.
    - **Frontend Refactor**: `api.ts` and `POS.tsx` no longer generate IDs client-side for new records (except for optimistic UI needs where handled carefully), delegating ID creation to the secure server logic.

#### F4. Missing CSP Headers
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Resolution**:
    - **CSP Added**: `index.html` now includes a strict `Content-Security-Policy` meta tag.
    - **Policy**: `default-src 'self'; script/style-src 'self' 'unsafe-inline';` allows necessary internal logic while blocking unauthorized external scripts and resources.

## Action Plan

### ✅ Completed
All identified security vulnerabilities (P1-P10, F1-F4) have been resolved. The application now employs a robust defense-in-depth strategy covering:
- Secure Authentication (HttpOnly Cookies + JWT)
- Network Security (CORS + HSTS + SSL Support)
- Data Integrity (Server-side Validation + Robust ID Gen)
- Client-Side Protection (CSP + Secure Randomness)

### 🗓️ Audit Log
- **2025-12-10**: Initial comprehensive audit and remediation of P1-P10, F1-F4.
- **2026-01-11**: Re-verification audit. Confirmed all security controls remain active and effective. No new vulnerabilities detected in the current codebase.

### 🔄 Monitoring
- Regularly check `php_error.log` for any authentication or validation failures.
- Ensure production environment defines `JWT_SECRET` and `ALLOWED_ORIGINS` in `.env`.
