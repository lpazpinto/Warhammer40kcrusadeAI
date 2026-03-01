export const ENV = {
  /**
   * Application identifier used in JWT session tokens.
   * Previously sourced from VITE_APP_ID (Manus OAuth). Now set via APP_ID env var.
   * If not set, falls back to "crusade-ai" as default.
   */
  appId: process.env.APP_ID ?? "crusade-ai",
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
};
