export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE =
  import.meta.env.VITE_APP_TITLE || "Warhammer Horde AI";

export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "/favicon.png";

// Generate GitHub login URL at runtime.
export const getGitHubLoginUrl = () => {
  return `${window.location.origin}/api/oauth/github/login`;
};

// Alias for backward compatibility — GitHub is now the only login method.
export const getLoginUrl = getGitHubLoginUrl;
