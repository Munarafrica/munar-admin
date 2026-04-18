# Google Login And Signup Frontend Integration Guide

The backend supports Google login/signup through:

```http
POST /api/auth/google
```

This endpoint accepts a Google ID token from the frontend, verifies it with Google, creates the user if they do not already exist, and returns the same auth payload as normal login.

## Required Environment Variables

Add the Google OAuth web client ID to the frontend environment:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

This must match one of the backend environment values:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

or:

```env
GOOGLE_CLIENT_IDS=id1.apps.googleusercontent.com,id2.apps.googleusercontent.com
```

## Google Cloud Setup

In Google Cloud Console, configure the OAuth client as a **Web application**.

Add authorized JavaScript origins:

```txt
http://localhost:5173
https://your-frontend-domain.com
```

If using the Google Identity Services popup/token flow, redirect URIs are usually not needed. If the frontend chooses a redirect-based implementation, add the callback URL they use.

## Install Package

For React/Vite, the easiest path is:

```bash
npm install @react-oauth/google
```

## App Provider Setup

Wrap the app with `GoogleOAuthProvider`.

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* existing app/router */}
    </GoogleOAuthProvider>
  );
}
```

## Google Button Implementation

Use the same Google button on both `/login` and `/signup`. The backend handles both login and signup automatically.

```tsx
import { GoogleLogin } from '@react-oauth/google';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    userType: 'ORGANISER' | 'ATTENDEE' | 'STAFF' | 'ADMIN';
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
  };
};

type TwoFactorResponse = {
  requiresTwoFactor: true;
  challengeToken: string;
  channel: 'EMAIL' | 'PHONE';
  destination: string;
  expiresAt: string;
  message: string;
};

async function signInWithGoogle(credential: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Google sign-in failed');
  }

  return data as AuthResponse | TwoFactorResponse;
}

export function GoogleAuthButton() {
  return (
    <GoogleLogin
      onSuccess={async credentialResponse => {
        if (!credentialResponse.credential) {
          throw new Error('Google did not return a credential');
        }

        const result = await signInWithGoogle(credentialResponse.credential);

        if ('requiresTwoFactor' in result) {
          // Route to the existing 2FA verification screen.
          // Store result.challengeToken and show result.message/destination.
          return;
        }

        // Store tokens using the same logic as normal login.
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);

        // Store user if your app already does that.
        localStorage.setItem('user', JSON.stringify(result.user));

        // Redirect to dashboard/onboarding.
      }}
      onError={() => {
        // Show toast/message: Google sign-in failed.
      }}
      text="continue_with"
      width="100%"
    />
  );
}
```

## Backend Request Shape

The backend accepts either of these:

```json
{
  "credential": "GOOGLE_ID_TOKEN_FROM_GOOGLE_IDENTITY_SERVICES"
}
```

or:

```json
{
  "idToken": "GOOGLE_ID_TOKEN"
}
```

For signup, the frontend may optionally include:

```json
{
  "credential": "GOOGLE_ID_TOKEN",
  "userType": "ORGANISER"
}
```

If `userType` is omitted, the backend defaults to `ORGANISER`.

## Successful Auth Response

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "user-id",
    "email": "ada@example.com",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "userType": "ORGANISER",
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "2026-04-18T00:00:00.000Z"
  }
}
```

The frontend should treat this exactly like the existing email/password login response.

## Possible 2FA Response

If an existing user has 2FA enabled, Google login can return:

```json
{
  "requiresTwoFactor": true,
  "challengeToken": "challenge-id",
  "channel": "EMAIL",
  "destination": "a*a@example.com",
  "expiresAt": "2026-04-18T00:10:00.000Z",
  "message": "A 6-digit verification code has been sent to your email address."
}
```

In that case, route the user to the existing 2FA screen and call the existing endpoint:

```http
POST /api/auth/2fa/verify
```

## Error Handling

Common backend errors:

```txt
400 Google ID token is required
401 Invalid Google token
401 Invalid Google token audience
401 Expired Google token
403 Your account is inactive
500 Google authentication is not configured
```

Recommended frontend fallback message:

```ts
const fallbackMessage = 'Google sign-in failed. Please try again.';
```

For `500 Google authentication is not configured`, show a generic user-facing error, but log/report it because it means the backend environment is missing or mismatched.

## Important Notes

The frontend should not send Google access tokens to the backend for this flow. Send the Google ID token exposed by `credentialResponse.credential`.

Use the same Google button on login and signup. The backend decides whether to create a new account or log in an existing one based on the verified Google email.

Google-created users are automatically email-verified because Google confirms the email before issuing the token.
