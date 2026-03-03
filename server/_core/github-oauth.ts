/**
 * GitHub OAuth service module.
 * Uses native fetch for all GitHub API communication.
 * Implements CSRF protection via state parameter stored in httpOnly cookie.
 */
import crypto from "crypto";
import { ENV } from "./env";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE = "https://api.github.com";

/** Scopes required: read user profile + user emails (for account linking) */
const SCOPES = "read:user user:email";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

/**
 * Generate a cryptographically secure random state for CSRF protection.
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Build the GitHub OAuth authorization URL.
 */
export function getGitHubAuthUrl(state: string): string {
  const callbackUrl =
    ENV.githubCallbackUrl ||
    `${process.env.VITE_APP_URL || ""}/api/oauth/github/callback`;

  if (!callbackUrl.startsWith("http")) {
    throw new Error(
      "GitHub OAuth callback URL must be absolute. Set GITHUB_CALLBACK_URL or VITE_APP_URL."
    );
  }

  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", ENV.githubClientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Structured error thrown when the GitHub token exchange fails.
 * Contains only safe diagnostic fields — never the code, secret, or token.
 */
export class TokenExchangeError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string | undefined,
    public readonly errorDescription: string | undefined
  ) {
    super(
      `GitHub token exchange failed: ${status} ${errorCode ?? "unknown"}`
    );
    this.name = "TokenExchangeError";
  }
}

/**
 * Exchange an authorization code for an access token.
 * POST https://github.com/login/oauth/access_token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: ENV.githubClientId,
      client_secret: ENV.githubClientSecret,
      code,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    message?: string;
  };

  if (!response.ok || data.error || !data.access_token) {
    throw new TokenExchangeError(
      response.status,
      data.error,
      data.error_description ?? data.message
    );
  }

  return data.access_token;
}

/**
 * Fetch the authenticated GitHub user profile.
 * GET https://api.github.com/user
 */
export async function getGitHubUser(
  accessToken: string
): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub user fetch failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as GitHubUser;
}

/**
 * Fetch the authenticated user's email addresses.
 * GET https://api.github.com/user/emails
 * Returns all emails; caller should filter for verified + primary.
 */
export async function getGitHubUserEmails(
  accessToken: string
): Promise<GitHubEmail[]> {
  const response = await fetch(`${GITHUB_API_BASE}/user/emails`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub emails fetch failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as GitHubEmail[];
}

/**
 * Find the primary verified email from a list of GitHub emails.
 * Returns null if no email matches both criteria.
 */
export function findPrimaryVerifiedEmail(
  emails: GitHubEmail[]
): string | null {
  const primary = emails.find((e) => e.primary && e.verified);
  return primary?.email ?? null;
}
