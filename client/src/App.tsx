import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import PlayerDetail from "./pages/PlayerDetail";
import BattleSetup from "./pages/BattleSetup";
import BattlePlay from "./pages/BattlePlay";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaign/:id" component={CampaignDetail} />
      <Route path="/player/:id" component={PlayerDetail} />
      <Route path="/battle/setup/:campaignId" component={BattleSetup} />
      <Route path="/battle/play/:battleId" component={BattlePlay} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

