# Explanation

## What was the bug?

The `HttpClient` failed to refresh its OAuth2 token when the current token was a plain object (e.g., loaded from a state cache) rather than an instance of the `OAuth2Token` class. Additionally, it wouldn't set the `Authorization` header for such tokens even if they were valid.

## Why did it happen?

The validation logic used a combination of truthiness and `instanceof OAuth2Token`. Specifically:
1. `!this.oauth2Token` skipped the refresh if a plain object was present (truthy).
2. `this.oauth2Token instanceof OAuth2Token` was required to check `expired`.
3. The header was only set if `this.oauth2Token instanceof OAuth2Token`.

Plain objects failed both the expiration check and the header assignment, resulting in no `Authorization` header being sent.

## Why does fix solve it?

The fix uses a strict `instanceof OAuth2Token` check. If the token is not a class instance (which covers `null`, `undefined`, and plain objects), it triggers a `refreshOAuth2()`. Since `refreshOAuth2()` ensures the token is a proper `OAuth2Token` instance, the subsequent `instanceof` check passes, and the header is correctly applied.

## Edge case not covered

The current implementation depends on the system clock (`Date.now()`). If the client's clock is out of sync with the API server (clock skew), a token might be considered valid by the client but rejected as expired by the server. A robust solution would include a "buffer" time (e.g., refreshing 30 seconds before actual expiry).
