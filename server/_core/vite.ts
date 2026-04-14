import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import { type Server } from "http";
import path from "path";

// Shared SPA catch-all rate limiter used by both dev (setupVite) and
// production (serveStatic) to keep limits consistent in one place.
const spaFallbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // 120 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Development mode: sets up Vite dev server with HMR.
 *
 * `vite` is loaded lazily via dynamic import so that the production bundle
 * never evaluates it.  Since `vite` is a devDependency it is not installed
 * in the runtime Docker stage (`pnpm install --prod`).
 *
 * The Vite config is loaded by Vite itself (auto-detected from the project
 * root), so we do NOT import `vite.config.ts` here.  This prevents
 * esbuild from bundling vite.config.ts and its dev-only plugin imports
 * (`@vitejs/plugin-react`, `@tailwindcss/vite`, etc.) into the server
 * bundle, which would cause MODULE_NOT_FOUND crashes in production.
 */
export async function setupVite(app: Express, server: Server) {
  // Dynamic imports — only resolved at runtime in development
  const { createServer: createViteServer } = await import("vite");
  const { nanoid } = await import("nanoid");

  const vite = await createViteServer({
    // Vite auto-detects vite.config.ts from the project root at runtime.
    // We do NOT set configFile here — omitting it (defaults to undefined)
    // lets Vite resolve the config file itself.  Setting `true` would cause
    // ERR_INVALID_ARG_TYPE because Vite passes the value to path.resolve().
    //
    // allowedHosts is NOT set here because vite.config.ts already defines
    // an explicit allowlist.  Setting `true` would allow any Host header,
    // creating a DNS rebinding risk.
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Development SPA fallback can trigger filesystem reads on every request.
  // Apply rate limiting to reduce DoS risk from request floods.
  app.use("*", spaFallbackLimiter, async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Health-check endpoint — registered before the distPath guard so it is
  // always available, even when the build directory is missing (degraded mode).
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "client")
      : path.resolve(import.meta.dirname, "..", "client");

  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static] Could not find the build directory: ${distPath}, make sure to build the client first. ` +
        `The server will start but will not serve static files.`
    );
    return;
  }

  app.use(express.static(distPath));

  // SPA fallback: any route not matched by API or static files serves index.html.
  // Rate-limited to prevent file-system exhaustion (CodeQL: Missing rate limiting).
  const indexPath = path.resolve(distPath, "index.html");
  app.use("*", spaFallbackLimiter, (_req, res, next) => {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[Static] Failed to send index.html:`, err);
        if (res.headersSent) {
          return next(err);
        }
        res.status(500).send("Internal Server Error");
      }
    });
  });
}
