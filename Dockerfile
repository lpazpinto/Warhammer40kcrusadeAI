# ──────────────────────────────────────────────
# Stage 1: builder – install all deps and build
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Enable corepack so pnpm is available at the version pinned in package.json
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy dependency manifests and patches first (better layer caching)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies (including devDependencies for the build step)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build client (Vite → dist/client/) and server (esbuild → dist/server/index.js)
RUN pnpm build

# ──────────────────────────────────────────────
# Stage 2: runtime – production-only image
# ──────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests and patches for production install
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Copy migration runner and SQL migration files needed for db:migrate
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle

# Transfer ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 3000

# Run as non-root user
USER appuser

# Start the server
CMD ["node", "dist/server/index.js"]
