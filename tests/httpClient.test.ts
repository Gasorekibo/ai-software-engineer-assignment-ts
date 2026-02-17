import { HttpClient } from "../src/httpClient";
import { OAuth2Token } from "../src/tokens";
import { describe, test, expect } from "vitest";

describe("HttpClient OAuth2 behavior", () => {
  test("api=true sets Authorization header when token is valid", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("ok", Math.floor(Date.now() / 1000) + 3600);

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer ok");
  });

  test("api=true refreshes when token is missing", () => {
    const c = new HttpClient();
    c.oauth2Token = null;

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true refreshes when token is a plain object", () => {
    // This was the key failing case.
    const c = new HttpClient();
    c.oauth2Token = { accessToken: "stale", expiresAt: 0 };

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true refreshes when token is expired", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("old", Math.floor(Date.now() / 1000) - 10);

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=false (default) does not set Authorization header", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("ok", Math.floor(Date.now() / 1000) + 3600);

    const resp = c.request("GET", "/me");

    expect(resp.headers.Authorization).toBeUndefined();
  });

  test("preserves custom headers", () => {
    const c = new HttpClient();
    const resp = c.request("GET", "/me", { headers: { "X-Test": "val" } });

    expect(resp.headers["X-Test"]).toBe("val");
  });

  test("returns correct method and path", () => {
    const c = new HttpClient();
    const resp = c.request("POST", "/submit");

    expect(resp.method).toBe("POST");
    expect(resp.path).toBe("/submit");
  });
});