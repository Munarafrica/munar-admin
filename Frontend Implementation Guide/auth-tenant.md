# Frontend Implementation Guide

This guide is for integrating a Next.js frontend with the current Munar backend implementation for:

- Authentication
- Tenant management

All details below are based on the actual backend code in this repository.

## 1. Base API setup

The Nest app uses this global prefix:

```txt
/api
```

So if your backend runs on `http://localhost:8000`, your frontend should call endpoints like:

```txt
http://localhost:8000/api/auth/login
http://localhost:8000/api/tenants
```

### CORS

The backend allows CORS for:

- `FRONTEND_URL`
- fallback: `http://localhost:3000`

If your Next.js app runs on another origin, update the backend `FRONTEND_URL`.

### Swagger

Swagger is available at:

```txt
/api/docs
```

Example local URL:

```txt
http://localhost:8000/api/docs
```

## 2. Auth model overview

The backend uses:

- `accessToken` for authenticated API calls
- `refreshToken` for issuing a new access token
- bearer auth via `Authorization: Bearer <accessToken>`

### Important backend behavior

- Almost every route is protected by default.
- Only endpoints marked `@Public()` are accessible without a token.
- Auth tokens are returned in JSON, not cookies.
- Refresh tokens are persisted and rotated on refresh.
- Logout revokes the provided refresh token.
- Resetting password revokes all active refresh tokens.

## 3. Recommended Next.js auth architecture

Use this pattern in your frontend:

1. Store `accessToken` in memory when possible.
2. Store `refreshToken` in a secure server-side cookie if you are using a Next.js BFF pattern.
3. Send `Authorization: Bearer <accessToken>` on protected requests.
4. On `401 UNAUTHORIZED`, call `POST /api/auth/refresh`, then retry once.
5. On refresh failure, clear session and redirect to login.

If you are not using a BFF/server route layer, you can still store both tokens client-side, but that is less secure than an httpOnly cookie approach.

## 4. Shared TypeScript types

These are the frontend-safe response shapes based on the backend.

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

export type MeResponse = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  userType: UserType;
  isEmailVerified: boolean;
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

**Request body**

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

**Validation**

- `email` must be valid
- `password` minimum length is `8`
- `phone`, if provided, must be a valid phone number
- `userType` must be one of: `ORGANISER | ATTENDEE | STAFF | ADMIN`
- if `userType` is omitted, backend defaults to `ORGANISER`

**Example payload**

```json
{
  "email": "ade@munar.com",
  "password": "Password123!",
  "firstName": "Ade",
  "lastName": "Isaiah",
  "phone": "+2348000000000",
  "userType": "ORGANISER"
}
```

**Response**

```ts
type RegisterResponse = AuthResponse;
```

**Example response**

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "email": "ade@munar.com",
    "firstName": "Ade",
    "lastName": "Isaiah",
    "userType": "ORGANISER",
    "isEmailVerified": false,
    "isActive": true,
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
}
```

**Frontend action**

- Save both tokens
- Initialize auth state from `user`
- Redirect user into onboarding or tenant creation flow

### 5.2 Login

**Endpoint**

```txt
POST /api/auth/login
```

**Public:** Yes

**Request body**

```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

**Example payload**

```json
{
  "email": "ade@munar.com",
  "password": "Password123!"
}
```

**Response**

```ts
type LoginResponse = AuthResponse;
```

**Common errors**

- `401 UNAUTHORIZED` for invalid credentials
- `403 FORBIDDEN` if account is inactive

### 5.3 Refresh token

**Endpoint**

```txt
POST /api/auth/refresh
```

**Public:** Yes

**Request body**

```ts
type RefreshTokenRequest = {
  refreshToken: string;
};
```

**Response**

```ts
type RefreshTokenResponse = AuthResponse;
```

**Important behavior**

- The old refresh token is revoked.
- A new access token and new refresh token are returned.
- Always replace the old refresh token with the new one.

### 5.4 Forgot password

**Endpoint**

```txt
POST /api/auth/forgot-password
```

**Public:** Yes

**Request body**

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

**Actual success message**

```txt
If an account exists for that email, a password reset link has been sent.
```

**Frontend action**

- Always show a generic success UI
- Do not reveal whether the email exists

### 5.5 Reset password

**Endpoint**

```txt
POST /api/auth/reset-password
```

**Public:** Yes

**Request body**

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

**Common errors**

- `400 VALIDATION_ERROR` for invalid body
- `400 VALIDATION_ERROR` with message like `Invalid or expired password reset token`

### 5.6 Logout

**Endpoint**

```txt
POST /api/auth/logout
```

**Public:** Yes

**Request body**

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

**Frontend action**

- Send current refresh token
- Clear access token, refresh token, user state, selected tenant state

### 5.7 Get current user

**Endpoint**

```txt
GET /api/auth/me
```

**Public:** No

**Headers**

```txt
Authorization: Bearer <accessToken>
```

**Response**

```ts
type GetMeResponse = MeResponse;
```

**Example response**

```json
{
  "id": "user-id",
  "email": "ade@munar.com",
  "firstName": "Ade",
  "lastName": "Isaiah",
  "phone": "+2348000000000",
  "userType": "ORGANISER",
  "isEmailVerified": false,
  "isActive": true,
  "createdAt": "2026-03-26T10:00:00.000Z",
  "updatedAt": "2026-03-26T10:00:00.000Z",
  "memberships": [
    {
      "id": "membership-id",
      "role": "OWNER",
      "acceptedAt": "2026-03-26T10:05:00.000Z",
      "tenant": {
        "id": "tenant-id",
        "slug": "munar-demo-events",
        "name": "Munar Demo Events",
        "tenantType": "ORGANISATION",
        "defaultCurrency": "NGN",
        "timezone": "Africa/Lagos"
      }
    }
  ]
}
```

**Frontend use**

- Hydrate the current user session
- Build tenant switcher from `memberships`
- Derive current user role per tenant

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

**Request body**

```ts
type CreateTenantRequest = {
  name: string;
  slug?: string;
  tenantType?: TenantType;
  defaultCurrency?: string;
  timezone?: string;
};
```

**Validation**

- `name`: length `2-100`
- `slug`: optional, length `3-80`, lowercase letters/numbers/hyphens only
- `tenantType`: `INDIVIDUAL | ORGANISATION | AGENCY`
- `defaultCurrency`: 3-letter supported ISO code, backend uppercases it
- `timezone`: string

**Example payload**

```json
{
  "name": "Munar Demo Events",
  "slug": "munar-demo-events",
  "tenantType": "ORGANISATION",
  "defaultCurrency": "NGN",
  "timezone": "Africa/Lagos"
}
```

**Response**

The backend returns the newly created tenant including members.

```ts
type CreateTenantResponse = {
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
  members: Array<{
    id: string;
    tenantId: string;
    userId: string;
    role: MembershipRole;
    invitedEmail: string | null;
    acceptedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      userType: UserType;
      isEmailVerified: boolean;
      isActive: boolean;
      activeTenantId: string | null;
      lastLoginAt: string | null;
      passwordChangedAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }>;
};
```

**Behavior**

- If `slug` is omitted, backend derives one from `name`
- If derived slug already exists, backend appends a suffix like `-2`, `-3`
- Creator becomes `OWNER`
- Defaults:
  - `tenantType`: `INDIVIDUAL`
  - `defaultCurrency`: `NGN`
  - `timezone`: `Africa/Lagos`

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

**Frontend use**

- Populate workspace switcher
- Save selected `tenantId` in client state, cookie, or URL

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

**Common error**

- `403 FORBIDDEN` if the user is not a member of the tenant

### 6.4 Update tenant

**Endpoint**

```txt
PATCH /api/tenants/:tenantId
```

**Role required**

- `OWNER`
- `ADMIN`

**Request body**

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

**Example payload**

```json
{
  "name": "Munar Operations Hub",
  "slug": "munar-operations-hub",
  "tenantType": "ORGANISATION",
  "defaultCurrency": "NGN",
  "timezone": "Africa/Lagos",
  "brandingJson": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "primaryColor": "#111827"
  },
  "settingsJson": {
    "allowGuestCheckout": true
  }
}
```

**Response**

```ts
type UpdateTenantResponse = {
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
```

**Common errors**

- `403 FORBIDDEN` if current role is not allowed
- `400 VALIDATION_ERROR` if payload is invalid
- `400 VALIDATION_ERROR` with message `Slug is already in use`

### 6.5 List tenant members

**Endpoint**

```txt
GET /api/tenants/:tenantId/members
```

**Response**

```ts
type ListTenantMembersResponse = Array<{
  id: string;
  role: MembershipRole;
  invitedEmail: string | null;
  acceptedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    userType: UserType;
    isActive: boolean;
    isEmailVerified: boolean;
  } | null;
}>;
```

**Frontend use**

- Team management table
- Role badge display
- Permission-aware UI

### 6.6 Invite tenant member

**Endpoint**

```txt
POST /api/tenants/:tenantId/invitations
```

**Role required**

- `OWNER`
- `ADMIN`

**Request body**

```ts
type InviteTenantMemberRequest = {
  email: string;
  role: MembershipRole;
};
```

**Example payload**

```json
{
  "email": "ops@munar.com",
  "role": "STAFF"
}
```

**Response**

```ts
type InviteTenantMemberResponse = {
  id: string;
  tenantId: string;
  email: string;
  role: MembershipRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  invitedById: string | null;
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
  invitedBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    userType: UserType;
    isEmailVerified: boolean;
    isActive: boolean;
    lastLoginAt: string | null;
    passwordChangedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};
```

**Important implementation note**

The backend currently returns the raw invitation `token` in the response. That is useful for testing and direct-link flows, but you should treat it as sensitive and avoid rendering it in the UI unless you intentionally want a copy-invite-link feature.

**Common errors**

- user already belongs to tenant
- an active invitation already exists for that email
- current actor lacks `OWNER` or `ADMIN`

### 6.7 List tenant invitations

**Endpoint**

```txt
GET /api/tenants/:tenantId/invitations
```

**Response**

```ts
type ListTenantInvitationsResponse = Array<{
  id: string;
  email: string;
  role: MembershipRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}>;
```

**Frontend use**

- Pending invites table
- Expiry and status badges

### 6.8 Accept tenant invitation

**Endpoint**

```txt
POST /api/tenants/invitations/accept
```

**Request body**

```ts
type AcceptTenantInvitationRequest = {
  token: string;
};
```

**Response**

There are two possible success shapes.

```ts
type AcceptTenantInvitationResponse =
  | {
      message: 'Invitation accepted successfully';
      tenantId: string;
      memberId: string;
      role: MembershipRole;
    }
  | {
      message: 'You are already a member of this tenant';
      tenantId: string;
    };
```

**Important frontend behavior**

- User must already be authenticated.
- The invitation email must match the logged-in user email.
- After success, refresh user profile via `GET /api/auth/me`.
- Redirect into the accepted tenant using returned `tenantId`.

**Common errors**

- `404 NOT_FOUND` if invitation token cannot be matched
- `400 VALIDATION_ERROR` if invite is expired or inactive
- `403 FORBIDDEN` if invite belongs to a different email/account

### 6.9 Update tenant member role

**Endpoint**

```txt
PATCH /api/tenants/:tenantId/members/:memberId/role
```

**Role required**

- `OWNER`
- `ADMIN`

**Request body**

```ts
type UpdateTenantMemberRoleRequest = {
  role: MembershipRole;
};
```

**Example payload**

```json
{
  "role": "EDITOR"
}
```

**Response**

The backend returns the updated membership record including user details.

```ts
type UpdateTenantMemberRoleResponse = {
  id: string;
  tenantId: string;
  userId: string | null;
  role: MembershipRole;
  invitedEmail: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    userType: UserType;
    isEmailVerified: boolean;
    isActive: boolean;
    activeTenantId: string | null;
    lastLoginAt: string | null;
    passwordChangedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};
```

**Important role rules**

- `ADMIN` cannot assign `OWNER`
- `ADMIN` cannot modify an `OWNER`
- last remaining `OWNER` cannot be demoted

### 6.10 Remove tenant member

**Endpoint**

```txt
DELETE /api/tenants/:tenantId/members/:memberId
```

**Role required**

- `OWNER`
- `ADMIN`

**Response**

The backend returns the deleted membership object.

```ts
type RemoveTenantMemberResponse = {
  id: string;
  tenantId: string;
  userId: string | null;
  role: MembershipRole;
  invitedEmail: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

**Important role rules**

- `ADMIN` cannot remove an `OWNER`
- last remaining `OWNER` cannot be removed

## 7. Error response format

All errors are wrapped in a global error envelope.

**Shape**

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

### Validation error example

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "slug",
      "errors": [
        "slug must contain only lowercase letters, numbers, and hyphens"
      ],
      "children": []
    }
  ],
  "timestamp": "2026-03-26T10:10:00.000Z",
  "path": "/api/tenants",
  "requestId": "req_xxxxx"
}
```

### Suggested frontend error handling

- If `code === 'VALIDATION_ERROR'`, render field-level messages from `details`
- If `code === 'UNAUTHORIZED'`, try refresh or redirect to login
- If `code === 'FORBIDDEN'`, show permission/membership message
- If `code === 'NOT_FOUND'`, show resource not found state

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

## 9. Suggested frontend modules

### Auth pages

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password?token=...`

### Tenant pages

- `/app/tenants`
- `/app/tenants/new`
- `/app/tenants/[tenantId]`
- `/app/tenants/[tenantId]/members`
- `/app/tenants/[tenantId]/invitations`
- `/invitations/accept?token=...`

## 10. Recommended auth + tenant UX flow

### New user flow

1. User registers.
2. Frontend stores tokens.
3. Frontend calls `GET /api/auth/me`.
4. If no memberships exist, redirect to create tenant.
5. User creates tenant.
6. Save selected tenant in app state.
7. Route into tenant dashboard.

### Existing user flow

1. User logs in.
2. Frontend stores tokens.
3. Frontend calls `GET /api/auth/me`.
4. Load memberships into tenant switcher.
5. Restore previously selected tenant or default to first membership.

### Invitation acceptance flow

1. User opens `/invitations/accept?token=...`.
2. If not authenticated, save token temporarily and redirect to login.
3. After login, call `POST /api/tenants/invitations/accept`.
4. Refresh `GET /api/auth/me`.
5. Redirect into returned tenant.

## 11. Integration notes specific to this backend

- The backend invite email link is currently built with `APP_URL` and points to `/invitations/accept?token=...`.
- The password reset email link is built with `FRONTEND_URL` fallbacking to `APP_URL`.
- For consistency, set these environment variables carefully so links land in your Next.js app.
- Dates are serialized as ISO strings in JSON responses.
- Request bodies are validated with `whitelist: true` and `forbidNonWhitelisted: true`, so extra fields will fail validation.

## 12. Good frontend state to keep

At minimum, keep:

```ts
type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: MeResponse | null;
  activeTenantId: string | null;
};
```

## 13. Practical implementation checklist

- Add `NEXT_PUBLIC_API_BASE_URL`
- Build auth client for `register`, `login`, `refresh`, `logout`, `me`
- Build tenant client for create/list/get/update/member/invitation flows
- Add auth provider/session store
- Add auto-refresh logic for expired access tokens
- Add tenant switcher UI
- Add member management UI gated by role
- Add invitation accept page
- Add reset password page

## 14. Recommended first endpoints to wire up

Start with these in order:

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `POST /api/tenants`
5. `GET /api/tenants`
6. `GET /api/tenants/:tenantId`
7. `GET /api/tenants/:tenantId/members`
8. `POST /api/tenants/:tenantId/invitations`
9. `POST /api/tenants/invitations/accept`

If you want, the next step I can take is to generate the actual frontend TypeScript API client and auth store for your Next.js app based on this guide.
