export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate GitHub login URL at runtime.
export const getGitHubLoginUrl = () => {
  return `${window.location.origin}/api/oauth/github/login`;
};

// Alias for backward compatibility — GitHub is now the only login method.
export const getLoginUrl = getGitHubLoginUrl;
