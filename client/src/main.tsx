import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Recursively check for NaN values in an object
function hasNaNValue(obj: any, path: string = 'root'): string | null {
  if (typeof obj === 'number') {
    if (isNaN(obj) || !isFinite(obj)) {
      return path;
    }
    return null;
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = hasNaNValue(obj[i], `${path}[${i}]`);
      if (result) return result;
    }
    return null;
  }
  
  if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      const result = hasNaNValue(obj[key], `${path}.${key}`);
      if (result) return result;
    }
    return null;
  }
  
  return null;
}

// Custom transformer that validates data before sending
const validatingTransformer = {
  input: {
    serialize: (object: any) => {
      // Check for NaN BEFORE serialization
      const nanPath = hasNaNValue(object);
      if (nanPath) {
        console.error('[TRPC Client] ============ NaN DETECTED ============');
        console.error('[TRPC Client] NaN detected at path:', nanPath);
        console.error('[TRPC Client] Full object:', object);
        console.error('[TRPC Client] Object type:', typeof object);
        console.error('[TRPC Client] Current URL:', window.location.href);
        console.error('[TRPC Client] Stack trace:', new Error().stack);
        console.error('[TRPC Client] ========================================');
        // Don't throw, just log and let Zod validation handle it
        // throw new Error(`Invalid data: NaN value found at ${nanPath}`);
      }
      
      const serialized = superjson.serialize(object);
      
      // Double-check after serialization
      const jsonString = JSON.stringify(serialized);
      if (jsonString.includes('NaN') || jsonString.includes('Infinity')) {
        console.error('[TRPC Client] NaN/Infinity detected in serialized data:', object);
        throw new Error('Invalid data: NaN or Infinity values are not allowed');
      }
      
      return serialized;
    },
    deserialize: (object: any) => superjson.deserialize(object),
  },
  output: {
    serialize: (object: any) => superjson.serialize(object),
    deserialize: (object: any) => superjson.deserialize(object),
  },
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: validatingTransformer,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
