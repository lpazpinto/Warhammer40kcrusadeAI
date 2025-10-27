import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// Global logging middleware to debug NaN issues
const loggingMiddleware = t.middleware(async ({ path, type, input, next }) => {
  const inputStr = input !== undefined ? JSON.stringify(input) : 'undefined';
  console.log(`[tRPC] ${type} ${path}`, 'Input:', inputStr);
  
  // Check for NaN in input
  if (inputStr && inputStr.includes('NaN')) {
    console.error(`[tRPC] WARNING: NaN detected in input for ${path}:`, input);
    console.error(`[tRPC] Stack:`, new Error().stack);
  }
  
  return next();
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggingMiddleware);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(loggingMiddleware).use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
