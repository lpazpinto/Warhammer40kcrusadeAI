import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sword } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Auto-redirect authenticated users to campaigns
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation('/campaigns');
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
        <div className="text-center mb-8">
          <Sword className="h-20 w-20 mx-auto mb-4 text-primary" />
          <h1 className="text-5xl font-bold mb-4">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie suas campanhas de Cruzada do Warhammer 40.000 com IA controlando a Horda inimiga
          </p>
        </div>
        
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>
              Faça login para começar a gerenciar suas campanhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
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
