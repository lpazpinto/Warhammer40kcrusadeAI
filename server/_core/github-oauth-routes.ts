/**
 * GitHub OAuth routes.
 *
 * GET /api/oauth/github/login    → Redirect to GitHub authorization
 * GET /api/oauth/github/callback → Handle callback, link/create user, set session
 *
 * CSRF protection: a random `state` is stored in an httpOnly cookie and
 * validated when GitHub redirects back.
 */
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";
import * as db from "../db";
import {
  generateState,
  getGitHubAuthUrl,
  exchangeCodeForToken,
  getGitHubUser,
  getGitHubUserEmails,
  findPrimaryVerifiedEmail,
} from "./github-oauth";

const GITHUB_STATE_COOKIE = "github_oauth_state";
/** State cookie expires after 5 minutes */
const STATE_COOKIE_MAX_AGE_MS = 5 * 60 * 1000;

export function registerGitHubOAuthRoutes(app: Express) {
  /**
   * Step 1: Initiate GitHub OAuth flow.
   * Generates a CSRF state, stores it in a cookie, and redirects to GitHub.
   */
  app.get("/api/oauth/github/login", (req: Request, res: Response) => {
    if (!ENV.githubClientId) {
      res.status(503).json({ error: "GitHub OAuth is not configured" });
      return;
    }

    const state = generateState();
    const cookieOptions = getSessionCookieOptions(req);

    res.cookie(GITHUB_STATE_COOKIE, state, {
      ...cookieOptions,
      httpOnly: true,
      sameSite: "lax",
      secure: cookieOptions.secure,
      maxAge: STATE_COOKIE_MAX_AGE_MS,
    });

    const authUrl = getGitHubAuthUrl(state);
    res.redirect(302, authUrl);
  });

  /**
   * Step 2: GitHub redirects back with ?code=...&state=...
   * Validates CSRF state, exchanges code for token, fetches user info + emails,
   * performs account linking, creates session, and redirects to home.
   */
  app.get(
    "/api/oauth/github/callback",
    async (req: Request, res: Response) => {
      const code =
        typeof req.query.code === "string" ? req.query.code : undefined;
      const state =
        typeof req.query.state === "string" ? req.query.state : undefined;

      if (!code || !state) {
        res.status(400).json({ error: "code and state are required" });
        return;
      }

      // ── CSRF validation ──────────────────────────────────────────────
      const cookies = req.headers.cookie ?? "";
      const stateCookie = parseCookieValue(cookies, GITHUB_STATE_COOKIE);

      if (!stateCookie || stateCookie !== state) {
        res.status(403).json({ error: "Invalid state (CSRF check failed)" });
        return;
      }

      // Clear the state cookie immediately
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(GITHUB_STATE_COOKIE, {
        ...cookieOptions,
        maxAge: -1,
      });

      try {
        // ── Exchange code for access token ──────────────────────────────
        const accessToken = await exchangeCodeForToken(code);

        // ── Fetch GitHub user profile + emails (3 API calls total) ──────
        const [ghUser, ghEmails] = await Promise.all([
          getGitHubUser(accessToken),
          getGitHubUserEmails(accessToken),
        ]);

        const githubId = String(ghUser.id);
        const primaryEmail = findPrimaryVerifiedEmail(ghEmails);
        // Name fallback: use login (username) if name is null
        const displayName = ghUser.name || ghUser.login;

        console.log(
          `[GitHub OAuth] User: ${ghUser.login} (id=${githubId}), hasEmail=${!!primaryEmail}`
        );

        // ── Account linking logic ──────────────────────────────────────
        let user = await db.getUserByGithubId(githubId);

        if (!user && primaryEmail) {
          // Try to find existing user by verified primary email
          const existingByEmail = await db.getUserByEmail(primaryEmail);
          if (existingByEmail) {
            // Link GitHub account to existing Manus user
            await db.linkGithubAccount(existingByEmail.id, githubId);
            user = existingByEmail;
            console.log(
              `[GitHub OAuth] Linked GitHub ${githubId} to existing user ${existingByEmail.id}`
            );
          }
        }

        if (!user) {
          // Create new user with GitHub identity
          const openId = `github:${githubId}`;
          await db.upsertUser({
            openId,
            name: displayName,
            email: primaryEmail ?? null,
            loginMethod: "github",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(openId);

          if (user) {
            // Set githubId on the newly created user
            await db.linkGithubAccount(user.id, githubId);
          }

          console.log(
            `[GitHub OAuth] Created new user with openId=${openId}`
          );
        }

        if (!user) {
          res.status(500).json({ error: "Failed to create or find user" });
          return;
        }

        // Update last sign-in
        await db.upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });

        // ── Create session JWT ─────────────────────────────────────────
        // Use the user's existing openId (preserves Manus identity for linked users)
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: displayName,
          expiresInMs: ONE_YEAR_MS,
        });

        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.redirect(302, "/");
      } catch (error) {
        console.error("[GitHub OAuth] Callback failed:", error);
        res.status(500).json({ error: "GitHub OAuth callback failed" });
      }
    }
  );
}

/**
 * Simple cookie parser for a single value (avoids importing cookie-parser middleware).
 */
function parseCookieValue(
  cookieHeader: string,
  name: string
): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return undefined;
  const rawValue = match.slice(name.length + 1);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return undefined;
  }
}
