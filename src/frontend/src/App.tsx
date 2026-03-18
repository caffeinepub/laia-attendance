import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AdminApp from "./AdminApp";
import LoginScreen from "./LoginScreen";
import TeacherApp from "./TeacherApp";
import FountainBackground from "./components/FountainBackground";
import TargoHero from "./components/TargoHero";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [showLogin, setShowLogin] = useState(false);

  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && isAuthenticated && !actorFetching,
    staleTime: 60_000,
  });

  if (isInitializing || (isAuthenticated && actorFetching)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.05 265)" }}
      >
        <FountainBackground />
        <div
          className="relative flex flex-col items-center gap-4"
          style={{ zIndex: 2 }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: 100, height: 100 }}
          >
            <div className="ripple-ring" />
            <div className="ripple-ring" />
            <div className="ripple-ring" />
            <div
              className="relative z-10 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                background: "oklch(0.18 0.10 255 / 0.85)",
                border: "2px solid oklch(1 0 0 / 0.18)",
              }}
            />
          </div>
          <p
            className="text-white/50 text-sm"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <>
          <TargoHero onGetStarted={() => setShowLogin(true)} />
          <Toaster />
        </>
      );
    }
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  if (roleLoading || isAdmin === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.05 265)" }}
      >
        <FountainBackground />
        <div className="relative space-y-4 w-64" style={{ zIndex: 2 }}>
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-4 w-3/4 bg-white/8" />
          <Skeleton className="h-32 w-full bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <>
      {isAdmin ? <AdminApp /> : <TeacherApp />}
      <Toaster />
    </>
  );
}
