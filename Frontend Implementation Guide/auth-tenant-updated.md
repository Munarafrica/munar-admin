# Frontend Implementation Guide

This guide is for integrating a Next.js frontend with the current Munar backend implementation for:

- Authentication
- Tenant management

All details below reflect the current backend code in this repository.

## 1. Base API setup

The Nest app uses this global prefix:

```txt
/api
```

If your backend runs locally on `http://localhost:8000`, your frontend should call:

```txt
http://localhost:8000/api/auth/login
http://localhost:8000/api/tenants
```

### CORS

The backend allows CORS for:

- `FRONTEND_URL`
- fallback: `http://localhost:3000`

### Swagger

Swagger is available at:

```txt
http://localhost:8000/api/docs
```

## 2. Authentication overview

The backend now uses this auth flow:

1. User registers.
2. Backend creates the account and sends an email verification link.
3. User cannot log in until their email is verified.
4. After successful verification, the backend sends a welcome email.
5. If 2FA is enabled, login returns a 2FA challenge instead of tokens.
6. User submits the 6-digit code to complete sign-in.

### Important behavior

- Most routes are protected by default.
- Public auth endpoints are explicitly marked `@Public()`.
- Tokens are returned in JSON, not cookies.
- Refresh tokens are rotated on refresh.
- Password reset revokes all active refresh tokens.
- Unverified users cannot log in.

## 3. Recommended Next.js architecture

Use this approach:

1. Keep `accessToken` in memory if possible.
2. Keep `refreshToken` in a secure server-side cookie if you use a Next.js BFF pattern.
3. Attach `Authorization: Bearer <accessToken>` to protected requests.
4. On `401`, call `POST /api/auth/refresh` and retry once.
5. If login returns `requiresTwoFactor: true`, route to a 2FA verification page instead of treating the user as signed in.

## 4. Shared TypeScript types

```ts
export type UserType = 'ORGANISER' | 'ATTENDEE' | 'STAFF' | 'ADMIN';

export type TenantType = 'INDIVIDUAL' | 'ORGANISATION' | 'AGENCY';

export type MembershipRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EDITOR'
  | 'FINANCE'
  | 'STAFF'
  | 'VIEWER';

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED';

export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'KES'
  | 'ZAR';

export type TwoFactorChannel = 'EMAIL' | 'PHONE';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  userType: UserType;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type TwoFactorChallengeResponse = {
  requiresTwoFactor: true;
  challengeToken: string;
  channel: TwoFactorChannel;
  destination: string;
  expiresAt: string;
  message: string;
};

export type RegisterResponse = {
  message: string;
};

export type MessageResponse = {
  message: string;
};

export type TwoFactorSettingsResponse = {
  enabled: boolean;
  channel: TwoFactorChannel | null;
  phoneConfigured: boolean;
};

export type MeResponse = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  userType: UserType;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorChannel: TwoFactorChannel | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships: Array<{
    id: string;
    role: MembershipRole;
    acceptedAt: string | null;
    tenant: {
      id: string;
      slug: string;
      name: string;
      tenantType: TenantType;
      defaultCurrency: CurrencyCode;
      timezone: string;
    };
  }>;
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
  code:
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INTERNAL_SERVER_ERROR';
  details?: unknown;
  timestamp: string;
  path: string;
  requestId: string;
};
```

## 5. Authentication endpoints

### 5.1 Register

**Endpoint**

```txt
POST /api/auth/register
```

**Public:** Yes

**Request**

```ts
type RegisterRequest = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: UserType;
};
```

**Response**

```ts
type RegisterResponse = {
  message: 'Registration successful. Please verify your email before logging in.';
};
```

**Important**

- Register no longer signs the user in immediately.
- It sends a verification email.
- Frontend should route to a `check-your-email` style screen.

### 5.2 Verify email

**Endpoint**

```txt
POST /api/auth/verify-email
```

**Public:** Yes

**Request**

```ts
type VerifyEmailRequest = {
  token: string;
};
```

**Response**

```ts
type VerifyEmailResponse = {
  message: 'Email verified successfully';
};
```

**Important**

- On success, the backend also sends a welcome email.
- After success, your frontend should redirect the user to login.

### 5.3 Resend verification email

**Endpoint**

```txt
POST /api/auth/resend-verification-email
```

**Public:** Yes

**Request**

```ts
type ResendVerificationEmailRequest = {
  email: string;
};
```

**Response**

```ts
type ResendVerificationEmailResponse = {
  message: 'If an account exists for that email, a verification email has been sent.';
};
```

### 5.4 Login

**Endpoint**

```txt
POST /api/auth/login
```

**Public:** Yes

**Request**

```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

**Response**

```ts
type LoginResponse = AuthResponse | TwoFactorChallengeResponse;
```

**Behavior**

- If the user is verified and 2FA is disabled, login returns tokens immediately.
- If the user is verified and 2FA is enabled, login returns a challenge instead.
- If the user is not verified, login fails with `403 FORBIDDEN`.

**Example 2FA challenge response**

```json
{
  "requiresTwoFactor": true,
  "challengeToken": "challenge-uuid",
  "channel": "EMAIL",
  "destination": "a***e@example.com",
  "expiresAt": "2026-03-26T12:30:00.000Z",
  "message": "A 6-digit verification code has been sent to your email address."
}
```

### 5.5 Verify 2FA code

**Endpoint**

```txt
POST /api/auth/2fa/verify
```

**Public:** Yes

**Request**

```ts
type VerifyTwoFactorRequest = {
  challengeToken: string;
  code: string; // 6 digits
};
```

**Response**

```ts
type VerifyTwoFactorResponse = AuthResponse;
```

### 5.6 Resend 2FA code

**Endpoint**

```txt
POST /api/auth/2fa/resend
```

**Public:** Yes

**Request**

```ts
type ResendTwoFactorRequest = {
  challengeToken: string;
};
```

**Response**

```ts
type ResendTwoFactorResponse = TwoFactorChallengeResponse;
```

### 5.7 Get current user

**Endpoint**

```txt
GET /api/auth/me
```

**Headers**

```txt
Authorization: Bearer <accessToken>
```

**Response**

```ts
type GetMeResponse = MeResponse;
```

### 5.8 Refresh token

**Endpoint**

```txt
POST /api/auth/refresh
```

**Public:** Yes

**Request**

```ts
type RefreshTokenRequest = {
  refreshToken: string;
};
```

**Response**

```ts
type RefreshTokenResponse = AuthResponse;
```

### 5.9 Forgot password

**Endpoint**

```txt
POST /api/auth/forgot-password
```

**Public:** Yes

**Request**

```ts
type ForgotPasswordRequest = {
  email: string;
};
```

**Response**

```ts
type ForgotPasswordResponse = {
  message: string;
};
```

### 5.10 Reset password

**Endpoint**

```txt
POST /api/auth/reset-password
```

**Public:** Yes

**Request**

```ts
type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};
```

**Response**

```ts
type ResetPasswordResponse = {
  message: 'Password reset successfully';
};
```

### 5.11 Logout

**Endpoint**

```txt
POST /api/auth/logout
```

**Public:** Yes

**Request**

```ts
type LogoutRequest = {
  refreshToken: string;
};
```

**Response**

```ts
type LogoutResponse = {
  message: 'Logged out successfully';
};
```

### 5.12 Get 2FA settings

**Endpoint**

```txt
GET /api/auth/2fa-settings
```

**Protected:** Yes

**Response**

```ts
type GetTwoFactorSettingsResponse = {
  enabled: boolean;
  channel: TwoFactorChannel | null;
  phoneConfigured: boolean;
};
```

### 5.13 Update 2FA settings

**Endpoint**

```txt
PATCH /api/auth/2fa-settings
```

**Protected:** Yes

**Request**

```ts
type UpdateTwoFactorSettingsRequest = {
  enabled: boolean;
  channel?: TwoFactorChannel;
};
```

**Response**

```ts
type UpdateTwoFactorSettingsResponse = {
  enabled: boolean;
  channel: TwoFactorChannel | null;
  phoneConfigured: boolean;
};
```

**Important**

- To enable `PHONE`, the user must already have a phone number on their account.
- For now, phone delivery uses the Termii SMS integration if configured; otherwise the backend falls back to a console/dev-style SMS fallback.

## 6. Tenant management endpoints

All tenant endpoints require:

```txt
Authorization: Bearer <accessToken>
```

### 6.1 Create tenant

**Endpoint**

```txt
POST /api/tenants
```

**Request**

```ts
type CreateTenantRequest = {
  name: string;
  slug?: string;
  tenantType?: TenantType;
  defaultCurrency?: string;
  timezone?: string;
};
```

**Response**

The backend returns the new tenant including members.

### 6.2 List my tenants

**Endpoint**

```txt
GET /api/tenants
```

**Response**

```ts
type ListMyTenantsResponse = Array<{
  membershipId: string;
  role: MembershipRole;
  acceptedAt: string | null;
  createdAt: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
    tenantType: TenantType;
    defaultCurrency: CurrencyCode;
    timezone: string;
    brandingJson: Record<string, unknown> | null;
    settingsJson: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
  };
}>;
```

### 6.3 Get tenant details

**Endpoint**

```txt
GET /api/tenants/:tenantId
```

**Response**

```ts
type GetTenantResponse = {
  id: string;
  slug: string;
  name: string;
  tenantType: TenantType;
  defaultCurrency: CurrencyCode;
  timezone: string;
  brandingJson: Record<string, unknown> | null;
  settingsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  currentUserRole: MembershipRole;
  stats: {
    memberCount: number;
    pendingInvitationCount: number;
  };
};
```

### 6.4 Update tenant

**Endpoint**

```txt
PATCH /api/tenants/:tenantId
```

**Role required**

- `OWNER`
- `ADMIN`

**Request**

```ts
type UpdateTenantRequest = {
  name?: string;
  slug?: string;
  tenantType?: TenantType;
  defaultCurrency?: string;
  timezone?: string;
  brandingJson?: Record<string, unknown>;
  settingsJson?: Record<string, unknown>;
};
```

### 6.5 List tenant members

**Endpoint**

```txt
GET /api/tenants/:tenantId/members
```

### 6.6 Invite tenant member

**Endpoint**

```txt
POST /api/tenants/:tenantId/invitations
```

**Role required**

- `OWNER`
- `ADMIN`

**Request**

```ts
type InviteTenantMemberRequest = {
  email: string;
  role: MembershipRole;
};
```

**Important**

- The current backend returns the raw invitation token in the response.
- Treat that token as sensitive.

### 6.7 List tenant invitations

**Endpoint**

```txt
GET /api/tenants/:tenantId/invitations
```

### 6.8 Accept tenant invitation

**Endpoint**

```txt
POST /api/tenants/invitations/accept
```

**Request**

```ts
type AcceptTenantInvitationRequest = {
  token: string;
};
```

**Important**

- User must already be authenticated.
- The invite email must match the logged-in account email.

### 6.9 Update tenant member role

**Endpoint**

```txt
PATCH /api/tenants/:tenantId/members/:memberId/role
```

**Role required**

- `OWNER`
- `ADMIN`

### 6.10 Remove tenant member

**Endpoint**

```txt
DELETE /api/tenants/:tenantId/members/:memberId
```

**Role required**

- `OWNER`
- `ADMIN`

## 7. Error response format

All errors use this shape:

```ts
type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId: string;
};
```

For validation failures, `details` contains field-level errors.

## 8. Suggested Next.js API wrapper

```ts
type RequestOptions = RequestInit & {
  accessToken?: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw error;
  }

  return response.json() as Promise<T>;
}
```

## 9. Suggested auth pages

- `/register`
- `/verify-email?token=...`
- `/login`
- `/login/2fa`
- `/forgot-password`
- `/reset-password?token=...`
- `/check-email`

## 10. Recommended frontend auth flow

### Registration flow

1. User submits register form.
2. Frontend calls `POST /api/auth/register`.
3. Frontend shows check-email screen.
4. User clicks verification link.
5. Frontend calls `POST /api/auth/verify-email`.
6. Frontend redirects user to login.

### Login flow without 2FA

1. User submits login form.
2. Backend returns `AuthResponse`.
3. Frontend stores tokens.
4. Frontend calls `GET /api/auth/me`.
5. Frontend routes into the app.

### Login flow with 2FA

1. User submits login form.
2. Backend returns `requiresTwoFactor: true`.
3. Frontend stores `challengeToken` temporarily.
4. Frontend routes to `/login/2fa`.
5. User enters the 6-digit code.
6. Frontend calls `POST /api/auth/2fa/verify`.
7. Backend returns `AuthResponse`.
8. Frontend stores tokens and continues normally.

### Invitation acceptance flow

1. User opens `/invitations/accept?token=...`.
2. If not authenticated, frontend stores invite token and redirects to login.
3. After login, frontend calls `POST /api/tenants/invitations/accept`.
4. Frontend refreshes `GET /api/auth/me`.
5. Frontend routes into the accepted tenant.

## 11. Implementation notes

- Email verification links use `FRONTEND_URL` and fall back to `APP_URL`.
- Password reset links also use `FRONTEND_URL`, falling back to `APP_URL`.
- Tenant invitation links currently use `APP_URL`.
- Dates are serialized as ISO strings.
- Extra request fields fail validation because the backend uses `whitelist: true` and `forbidNonWhitelisted: true`.

## 12. Verification email template location

The verification email template is located here:

- [src/notifications/templates/notification-template-renderer.ts](/Users/macbook/Documents/Qdubs/Munar/Codebase/munar-backend/src/notifications/templates/notification-template-renderer.ts)

The template key constant is here:

- [src/notifications/templates/notification-templates.ts](/Users/macbook/Documents/Qdubs/Munar/Codebase/munar-backend/src/notifications/templates/notification-templates.ts)

The logic that creates the verification token and sends the email is here:

- [src/auth/auth.service.ts](/Users/macbook/Documents/Qdubs/Munar/Codebase/munar-backend/src/auth/auth.service.ts)

## 13. Suggested environment variables

Make sure these are configured:

- `FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SENDGRID_API_KEY`
- `EMAIL_FROM`
- `EMAIL_VERIFICATION_EXPIRES_HOURS`
- `TWO_FACTOR_CODE_EXPIRES_MINUTES`

For phone-based 2FA with SMS delivery:

- `TERMII_API_KEY`
- `TERMII_SENDER_ID`
- `TERMII_BASE_URL`
- `TERMII_SMS_CHANNEL`

## 14. Practical frontend checklist

- Wire `register`
- Wire `verify-email`
- Wire `resend-verification-email`
- Wire `login`
- Wire `2fa/verify`
- Wire `2fa/resend`
- Wire `me`
- Wire `refresh`
- Wire `logout`
- Wire `2fa-settings`
- Build tenant switcher and tenant member flows

If you want, the next step I can take is to add the actual backend endpoints to your frontend integration guide as reusable Next.js service functions, or generate the frontend auth client code directly.
