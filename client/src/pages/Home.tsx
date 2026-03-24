import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { APP_TITLE, getGitHubLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Auto-redirect authenticated users to campaigns
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/campaigns");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-page min-h-screen flex flex-col items-center justify-center p-4">
        {/* Explicit runtime asset layer: grimdark metal background */}
        <div className="login-bg-overlay" aria-hidden="true">
          <picture className="login-bg-overlay__picture">
            <source
              srcSet="/assets/ui-theme/backgrounds/grimdark-metal-bg.webp"
              type="image/webp"
            />
            <img
              src="/assets/ui-theme/backgrounds/grimdark-metal-bg.png"
              alt=""
              aria-hidden="true"
              className="login-bg-overlay__image"
            />
          </picture>
        </div>

        {/* Hero + card area — constrained to max-w-md so the watermark is centered
             behind both title and login card as a single visual unit */}
        <div className="login-hero max-w-md w-full">
          {/* Explicit runtime asset layer: command sigil watermark */}
          <div className="login-sigil" aria-hidden="true">
            <picture className="login-sigil__picture">
              <source
                srcSet="/assets/ui-theme/overlays/command-sigil-watermark.webp"
                type="image/webp"
              />
              <img
                src="/assets/ui-theme/overlays/command-sigil-watermark.png"
                alt=""
                aria-hidden="true"
                className="login-sigil__image"
              />
            </picture>
          </div>

          {/* Hero panel — strip, emblem, title, subtitle in one cohesive block */}
          <div className="login-hero-panel w-full">
            {/* Internal sigil watermark for panel depth */}
            <div className="login-hero-panel__sigil" aria-hidden="true">
              <picture className="login-hero-panel__sigil-picture">
                <source
                  srcSet="/assets/ui-theme/overlays/command-sigil-watermark.webp"
                  type="image/webp"
                />
                <img
                  src="/assets/ui-theme/overlays/command-sigil-watermark.png"
                  alt=""
                  aria-hidden="true"
                  className="login-hero-panel__sigil-image"
                />
              </picture>
            </div>
            <div className="login-hero-panel__content text-center">
              <div className="login-identity-mark" aria-hidden="true">
                <picture className="login-identity-mark__picture">
                  <source
                    srcSet="/assets/ui-theme/icons/empty-state-emblem.webp"
                    type="image/webp"
                  />
                  <img
                    src="/assets/ui-theme/icons/empty-state-emblem.png"
                    alt=""
                    aria-hidden="true"
                    className="login-identity-mark__image"
                  />
                </picture>
              </div>
              <p className="command-title text-xs text-muted-foreground mb-3">
                Identificação Imperial
              </p>
              <h1 className="command-title text-5xl font-bold mb-4">
                {APP_TITLE}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerencie suas campanhas de Cruzada do Warhammer 40.000 com IA
                controlando a Horda inimiga
              </p>
            </div>
          </div>

          <Card className="login-dossier-card command-surface command-surface--themed w-full relative z-10">
            <CardHeader>
              <CardTitle>Bem-vindo</CardTitle>
              <CardDescription>
                Faça login para começar a gerenciar suas campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <a href={getGitHubLoginUrl()}>
                  <svg
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Entrar com GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
