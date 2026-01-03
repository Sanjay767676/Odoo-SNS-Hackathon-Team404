import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/AppLayout";

// Import pages
import Dashboard from "@/pages/Dashboard";
import CreateTrip from "@/pages/CreateTrip";
import MyTrips from "@/pages/MyTrips";
import ItineraryBuilder from "@/pages/ItineraryBuilder";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/create-trip" component={CreateTrip} />
        <Route path="/trips" component={MyTrips} />
        <Route path="/builder" component={ItineraryBuilder} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
