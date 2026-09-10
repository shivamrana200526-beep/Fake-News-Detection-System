import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
// Layout
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageWrapper } from "@/components/layout/PageWrapper";
// Pages
import Home from "@/pages/Home";
import Detect from "@/pages/Detect";
import Dashboard from "@/pages/Dashboard";
import Education from "@/pages/Education";
import About from "@/pages/About";
import Chat from "@/pages/Chat";
import Credibility from "@/pages/Credibility";
import Trending from "@/pages/Trending";
import Quiz from "@/pages/Quiz";
import Forward from "@/pages/Forward";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});
function Router() {
    return (<div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/">
              <PageWrapper><Home /></PageWrapper>
            </Route>
            <Route path="/detect">
              <PageWrapper><Detect /></PageWrapper>
            </Route>
            <Route path="/dashboard">
              <PageWrapper><Dashboard /></PageWrapper>
            </Route>
            <Route path="/education">
              <PageWrapper><Education /></PageWrapper>
            </Route>
            <Route path="/about">
              <PageWrapper><About /></PageWrapper>
            </Route>
            <Route path="/chat">
              <PageWrapper><Chat /></PageWrapper>
            </Route>
            <Route path="/credibility">
              <PageWrapper><Credibility /></PageWrapper>
            </Route>
            <Route path="/trending">
              <PageWrapper><Trending /></PageWrapper>
            </Route>
            <Route path="/quiz">
              <PageWrapper><Quiz /></PageWrapper>
            </Route>
            <Route path="/forward">
              <PageWrapper><Forward /></PageWrapper>
            </Route>
            <Route path="/history">
              <PageWrapper><History /></PageWrapper>
            </Route>
            <Route>
              <PageWrapper><NotFound /></PageWrapper>
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
      <Footer />
    </div>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
