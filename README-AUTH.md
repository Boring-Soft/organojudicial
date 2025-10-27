# Setting Up Passwordless Authentication with Supabase

This project includes multiple authentication methods using Supabase:

1. Traditional email/password login
2. Password reset flow
3. Passwordless login with magic links

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key to your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 2. Configure Authentication Settings in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Under **Email Templates**, customize your templates for:
   - **Confirm signup**
   - **Magic link**
   - **Reset password**

### 3. Configure Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add the following redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `http://localhost:3000/reset-password` (for password reset)
   - Your production URLs when deploying

### 4. Email Template Configuration

You need to update your email templates in the Supabase dashboard to work correctly with your application:

#### Reset Password Email Template

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password"
  >
    Reset Password
  </a>
</p>
```

#### Magic Link Email Template

```html
<h2>Magic Link Sign In</h2>

<p>Follow this link to sign in:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/dashboard"
  >
    Sign In
  </a>
</p>
```

## Testing Authentication

### Password Reset Flow

1. Go to the login page
2. Click "Forgot password?"
3. Enter your email address
4. Check your email for a reset link
5. Click the link to set a new password

### Magic Link Flow

1. Go to the login page
2. Click "Sign in with a magic link"
3. Enter your email address
4. Check your email for a magic link
5. Click the link to automatically sign in

## Troubleshooting

- **Redirects not working**: Ensure your URL Configuration in Supabase includes all necessary redirect URLs
- **Emails not arriving**: Check your spam folder or verify email settings in Supabase
- **Auth errors**: Make sure your environment variables are correctly set up

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
