# Client-Side Password Encryption

This document explains how client-side password encryption is implemented in our Next.js application with Supabase authentication.

## Overview

Client-side password encryption ensures that passwords are never sent in plain text over the network. Instead, passwords are hashed in the browser before being transmitted to the server. This adds an important layer of security to our authentication system.

## Implementation Details

### 1. Password Hashing Utility

Located at `src/lib/auth/password-crypto.ts`, this utility provides two main functions:

- `hashPassword()`: Hashes a password using SHA-256 via the Web Crypto API
- `saltAndHashPassword()`: Adds a salt (typically the user's email) to the password before hashing

### 2. Authentication Components

All authentication forms have been updated to use client-side password hashing:

- Sign Up form: `src/components/auth/sign-up/components/sign-up-form.tsx`
- Sign In form: `src/components/auth/sign-in/components/user-auth-form.tsx`
- Reset Password form: `src/components/auth/reset-password/components/reset-password-form.tsx`

### 3. Supabase Client Middleware

Located at `src/lib/supabase/password-hash-middleware.ts`, this middleware:

- Extends Supabase client methods to indicate that passwords are pre-hashed
- Adds custom headers to authentication requests
- Ensures correct handling of hashed passwords

### 4. Supabase Client Configuration

The Supabase client is configured to use the password hash middleware in `src/lib/supabase/client.ts`.

## Security Considerations

- The implementation uses the Web Crypto API, which is secure and widely supported
- Passwords are salted before hashing, adding an extra layer of security
- Custom headers inform the server that passwords are pre-hashed
- The original password never leaves the client

## Workflow

1. User enters password in a form
2. Client-side JavaScript hashes the password (with salt if applicable)
3. Hashed password is sent to Supabase with special headers
4. Supabase understands that the password is pre-hashed and handles it accordingly

## Additional Benefits

- Protects against network sniffing attacks
- Reduces risk from compromised TLS connections
- Adds defense-in-depth to the authentication system
- Follows security best practices for password handling

## Future Improvements

- Consider adding PBKDF2 or Argon2 for more secure password hashing
- Implement password rotation policies
- Add more comprehensive client-side validation
