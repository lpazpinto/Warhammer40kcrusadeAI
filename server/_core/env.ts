export const ENV = {
  /**
   * Application identifier used in JWT session tokens.
   * Set via APP_ID env var. Falls back to "crusade-ai" if not set.
   */
  appId: process.env.APP_ID?.trim() || "crusade-ai",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL ?? "",
  // TiDB TLS — normalize literal \n sequences (common from PaaS env vars) to real newlines
  tidbCaPem: (process.env.TIDB_CA_PEM ?? "").replace(/\\n/g, "\n").trim(),
};
