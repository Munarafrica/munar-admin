# Auth session refresh and expired-session UX

The backend uses JWT bearer auth with a 24-hour session window.

- `accessToken` lifetime: 24 hours
- `refreshToken` lifetime: 24 hours
- Protected requests use `Authorization: Bearer <accessToken>`
- Refresh endpoint: `POST /api/auth/refresh`
- Logout endpoint: `POST /api/auth/logout`

## Backend error codes

All API errors use the global error envelope:

```json
{
  "statusCode": 401,
  "message": "Access token expired",
  "error": "Unauthorized",
  "code": "ACCESS_TOKEN_EXPIRED",
  "timestamp": "2026-04-13T00:00:00.000Z",
  "path": "/api/auth/me",
  "requestId": "req_..."
}
```

Use these auth-specific codes:

- `ACCESS_TOKEN_EXPIRED`: the access token is expired. Attempt one refresh, then retry the original request.
- `REFRESH_TOKEN_INVALID`: the refresh token is invalid, expired, revoked, or no longer usable. Clear auth state and show the expired-session message.
- `UNAUTHORIZED`: generic auth failure. If it happens on a protected request and refresh has not been tried, attempt one refresh. If refresh fails, clear auth state.

## Required client behavior

Store both tokens securely:

- Web: prefer secure storage appropriate to the app's threat model. If tokens are in browser storage today, keep access centralized in one auth module.
- Mobile: use secure storage/keychain, not plain async storage for long-lived credentials.

On normal API requests:

1. Attach `Authorization: Bearer <accessToken>`.
2. If the request succeeds, do nothing.
3. If it fails with `401` and `code === "ACCESS_TOKEN_EXPIRED"` or `code === "UNAUTHORIZED"`, call `/api/auth/refresh` once.
4. If refresh succeeds, replace the stored `accessToken`. The refresh response currently returns the same refresh token again; still write it back so the client stays compatible if backend rotation is reintroduced later.
5. Retry the original request once.
6. If refresh fails with `REFRESH_TOKEN_INVALID` or any other `401`, clear all local auth state and redirect to login.

Show this message only when refresh fails and the app is logging the user out:

> Your session expired. Please log in again.

Do not show this message for the first expired access-token response if refresh succeeds; that should be invisible to the user.

## Single-flight refresh

Multiple requests can fail at the same time when the access token expires. The client must run only one refresh request at a time and make the other failed requests wait for it.

TypeScript-style example:

```ts
let refreshPromise: Promise<AuthTokens> | null = null;

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

async function refreshSession(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<AuthTokens>('/api/auth/refresh', {
        refreshToken: authStore.getRefreshToken(),
      })
      .then((response) => {
        const tokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };

        authStore.setTokens(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function requestWithAuth<T>(request: ApiRequest<T>): Promise<T> {
  try {
    return await request({
      Authorization: `Bearer ${authStore.getAccessToken()}`,
    });
  } catch (error) {
    if (!shouldAttemptRefresh(error)) {
      throw error;
    }

    try {
      const tokens = await refreshSession();

      return await request({
        Authorization: `Bearer ${tokens.accessToken}`,
      });
    } catch (refreshOrRetryError) {
      handleSessionExpired();
      throw refreshOrRetryError;
    }
  }
}

function shouldAttemptRefresh(error: unknown) {
  const status = getStatus(error);
  const code = getErrorCode(error);

  return (
    status === 401 &&
    (code === 'ACCESS_TOKEN_EXPIRED' || code === 'UNAUTHORIZED')
  );
}

function handleSessionExpired() {
  authStore.clear();
  navigation.replace('/login');
  toast.show('Your session expired. Please log in again.');
}
```

## Important safeguards

- Never retry a request more than once after refresh; otherwise a bad refresh path can create an infinite loop.
- Do not call `/api/auth/refresh` for login, register, forgot-password, reset-password, or refresh requests themselves.
- Do not show the expired-session message if the user manually clicks logout.
- On app launch, if stored tokens exist, call `/api/auth/me`. If it returns `ACCESS_TOKEN_EXPIRED`, refresh and retry `/api/auth/me`. If refresh fails, clear auth state and show the expired-session message.
- On mobile app resume, use the same launch check if the app has been backgrounded long enough that the access token may have expired.
- If the user is active for more than 24 hours, refresh will eventually fail because the refresh token lifetime is also 24 hours. At that point, log them out with the expired-session message.

## Minimal QA checklist

- Log in, wait for access token expiry or temporarily lower `JWT_ACCESS_EXPIRES_IN`, then confirm the next API call refreshes silently.
- Fire several protected API calls at the same time after access expiry and confirm only one refresh request is sent.
- Force `/api/auth/refresh` to return `REFRESH_TOKEN_INVALID` and confirm tokens are cleared, the user is routed to login, and the expired-session message appears once.
- Click manual logout and confirm the expired-session message does not appear.
