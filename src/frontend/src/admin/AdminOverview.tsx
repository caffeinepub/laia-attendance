import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Camera, MapPin, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { AttendanceSession, TeacherProfile, Village } from "../backend.d";
import GlassCard from "../components/GlassCard";
import { useActor } from "../hooks/useActor";

function AnimatedCount({
  target,
  loading,
}: { target: number; loading: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (target === 0) {
      setDisplay(0);
      return;
    }
    const steps = 30;
    const inc = target / steps;
    let current = 0;
    const id = setInterval(() => {
      current += inc;
      if (current >= target) {
        setDisplay(target);
        clearInterval(id);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(id);
  }, [target, loading]);

  if (loading) return <Skeleton className="h-9 w-16 bg-white/10" />;
  return (
    <p
      className="text-3xl font-bold text-white animate-count-up"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {display}
    </p>
  );
}

export default function AdminOverview() {
  const { actor } = useActor();

  const { data: villages = [], isLoading: vLoading } = useQuery({
    queryKey: ["allVillages"],
    queryFn: () => actor!.getAllVillages(),
    enabled: !!actor,
  });

  const { data: teachers = [], isLoading: tLoading } = useQuery({
    queryKey: ["allTeachers"],
    queryFn: () => actor!.getTeachers(),
    enabled: !!actor,
  });

  const { data: sessions = [], isLoading: sLoading } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => actor!.getAllSessions(),
    enabled: !!actor,
  });

  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter(
    (s: AttendanceSession) => s.date === today,
  ).length;

  const stats = [
    {
      label: "Villages",
      value: villages.length,
      icon: MapPin,
      loading: vLoading,
      color: "oklch(0.56 0.18 240 / 0.25)",
    },
    {
      label: "Teachers",
      value: teachers.length,
      icon: UserCheck,
      loading: tLoading,
      color: "oklch(0.55 0.15 150 / 0.25)",
    },
    {
      label: "Sessions Today",
      value: todaySessions,
      icon: Camera,
      loading: sLoading,
      color: "oklch(0.80 0.15 85 / 0.20)",
    },
    {
      label: "Total Sessions",
      value: sessions.length,
      icon: Camera,
      loading: sLoading,
      color: "oklch(0.65 0.18 290 / 0.20)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Overview
        </h1>
        <p className="text-white/50 text-sm mt-1">
          LAIA Foundation Attendance Dashboard
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, loading, color }) => (
          <GlassCard key={label} hover className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/55 uppercase tracking-wider">
                {label}
              </p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: color }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <AnimatedCount target={value} loading={loading} />
          </GlassCard>
        ))}
      </div>

      {/* Village summary */}
      <GlassCard className="overflow-hidden">
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <h2
            className="font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Village Summary
          </h2>
        </div>
        <div className="p-4">
          {vLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full bg-white/8" />
              ))}
            </div>
          ) : villages.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">
              No villages yet. Add villages to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {villages.map((v: Village, idx: number) => {
                const villageSessions = sessions.filter(
                  (s: AttendanceSession) =>
                    String(s.villageId) === String(v.id),
                );
                const villageTeacher = teachers.find(
                  (t: TeacherProfile) => String(t.villageId) === String(v.id),
                );
                return (
                  <div
                    data-ocid={`admin.village_item.${idx + 1}`}
                    key={String(v.id)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl transition-all"
                    style={{
                      background: "oklch(1 0 0 / 0.04)",
                      border: "1px solid oklch(1 0 0 / 0.07)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "oklch(1 0 0 / 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "oklch(1 0 0 / 0.04)";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "oklch(0.45 0.18 255 / 0.25)" }}
                      >
                        <MapPin className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {v.name}
                        </p>
                        <p className="text-xs text-white/45">
                          {villageTeacher?.name ?? "No teacher assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {villageSessions.length}
                      </p>
                      <p className="text-xs text-white/40">sessions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
