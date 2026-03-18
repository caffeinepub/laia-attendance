import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Camera,
  ChevronRight,
  Clock,
  LogOut,
  Users,
} from "lucide-react";
import { useState } from "react";
import AttendanceForm from "./AttendanceForm";
import CameraCapture from "./CameraCapture";
import type { AttendanceSession, Student } from "./backend.d";
import FountainBackground from "./components/FountainBackground";
import GlassCard from "./components/GlassCard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Screen = "dashboard" | "camera" | "attendance" | "sessions";

const DEMO_STUDENTS: Student[] = [
  {
    id: 1n,
    villageId: 1n,
    name: "Arjun Krishnamurthy",
    rollNo: "01",
    isActive: true,
  },
  { id: 2n, villageId: 1n, name: "Priya Selvam", rollNo: "02", isActive: true },
  { id: 3n, villageId: 1n, name: "Muthu Rajan", rollNo: "03", isActive: true },
  {
    id: 4n,
    villageId: 1n,
    name: "Kavitha Sundaram",
    rollNo: "04",
    isActive: true,
  },
  {
    id: 5n,
    villageId: 1n,
    name: "Surya Narayanan",
    rollNo: "05",
    isActive: true,
  },
  {
    id: 6n,
    villageId: 1n,
    name: "Divya Lakshmi",
    rollNo: "06",
    isActive: true,
  },
  {
    id: 7n,
    villageId: 1n,
    name: "Karthik Murugan",
    rollNo: "07",
    isActive: true,
  },
  { id: 8n, villageId: 1n, name: "Meena Devi", rollNo: "08", isActive: true },
  {
    id: 9n,
    villageId: 1n,
    name: "Senthil Kumar",
    rollNo: "09",
    isActive: true,
  },
  {
    id: 10n,
    villageId: 1n,
    name: "Anitha Rajendran",
    rollNo: "10",
    isActive: true,
  },
  {
    id: 11n,
    villageId: 1n,
    name: "Vijay Balaji",
    rollNo: "11",
    isActive: true,
  },
  {
    id: 12n,
    villageId: 1n,
    name: "Sangeetha Pari",
    rollNo: "12",
    isActive: true,
  },
  {
    id: 13n,
    villageId: 1n,
    name: "Prakash Velu",
    rollNo: "13",
    isActive: true,
  },
  {
    id: 14n,
    villageId: 1n,
    name: "Nithya Suresh",
    rollNo: "14",
    isActive: true,
  },
  {
    id: 15n,
    villageId: 1n,
    name: "Arun Pandian",
    rollNo: "15",
    isActive: true,
  },
  {
    id: 16n,
    villageId: 1n,
    name: "Revathi Annamalai",
    rollNo: "16",
    isActive: true,
  },
  {
    id: 17n,
    villageId: 1n,
    name: "Manikandan Pillai",
    rollNo: "17",
    isActive: true,
  },
  {
    id: 18n,
    villageId: 1n,
    name: "Deepa Venkatesh",
    rollNo: "18",
    isActive: true,
  },
  {
    id: 19n,
    villageId: 1n,
    name: "Bala Subramanian",
    rollNo: "19",
    isActive: true,
  },
  {
    id: 20n,
    villageId: 1n,
    name: "Lavanya Mohan",
    rollNo: "20",
    isActive: true,
  },
  {
    id: 21n,
    villageId: 1n,
    name: "Dinesh Ganesan",
    rollNo: "21",
    isActive: true,
  },
  {
    id: 22n,
    villageId: 1n,
    name: "Pooja Natarajan",
    rollNo: "22",
    isActive: true,
  },
  {
    id: 23n,
    villageId: 1n,
    name: "Ramesh Chandran",
    rollNo: "23",
    isActive: true,
  },
  {
    id: 24n,
    villageId: 1n,
    name: "Sudha Krishnan",
    rollNo: "24",
    isActive: true,
  },
  { id: 25n, villageId: 1n, name: "Harish Babu", rollNo: "25", isActive: true },
];

export default function TeacherApp() {
  const { clear } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>("");
  const [tiltStyle, setTiltStyle] = useState<Record<string, string>>({});

  const { data: village, isLoading: villageLoading } = useQuery({
    queryKey: ["myVillage"],
    queryFn: () => actor!.getMyVillage(),
    enabled: !!actor,
  });

  const { data: fetchedStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["myStudents"],
    queryFn: () => actor!.getMyStudents(),
    enabled: !!actor,
  });

  const students: Student[] =
    fetchedStudents.length > 0 ? fetchedStudents : DEMO_STUDENTS;

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["mySessions", village?.id],
    queryFn: () => actor!.getSessions(village!.id),
    enabled: !!actor && !!village,
  });

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todaySessionsCount = sessions.filter(
    (s: AttendanceSession) => s.date === todayStr,
  ).length;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handlePhotoCaptured = (url: string) => {
    setCapturedPhotoUrl(url);
    setScreen("attendance");
  };

  const handleAttendanceSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["mySessions"] });
    setScreen("dashboard");
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (y / rect.height - 0.5) * 14;
    const ry = (x / rect.width - 0.5) * -14;
    setTiltStyle({
      transform: `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`,
      transition: "transform 0.1s ease",
    });
  };

  const handleCardMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s ease",
    });
  };

  if (screen === "camera") {
    return (
      <CameraCapture
        onCapture={handlePhotoCaptured}
        onCancel={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "attendance" && capturedPhotoUrl) {
    return (
      <AttendanceForm
        students={students}
        photoUrl={capturedPhotoUrl}
        villageName={village?.name ?? ""}
        onSubmitted={handleAttendanceSubmitted}
        onCancel={() => setScreen("dashboard")}
      />
    );
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTamil = (d: Date) =>
    d.toLocaleDateString("ta-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  return (
    <div
      className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-x-hidden"
      style={{ background: "oklch(0.10 0.05 265)" }}
    >
      <FountainBackground />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 0%, oklch(0.22 0.12 255 / 0.5) 0%, transparent 65%)",
          zIndex: 1,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div
          className="px-4 pt-safe pt-5 pb-7"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.22 0.14 265) 0%, oklch(0.32 0.16 255) 50%, oklch(0.42 0.18 245) 100%)",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div>
                {villageLoading ? (
                  <Skeleton className="h-5 w-32 bg-white/20" />
                ) : (
                  <>
                    <h1
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {village?.name ?? "Your Village"}
                    </h1>
                    <p className="text-xs text-white/60">Teacher Dashboard</p>
                  </>
                )}
              </div>
            </div>
            <Button
              data-ocid="auth.logout_button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/15 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Date pill */}
          <div
            className="mt-4 rounded-xl p-3 flex items-center gap-3"
            style={{
              background: "oklch(1 0 0 / 0.10)",
              border: "1px solid oklch(1 0 0 / 0.12)",
            }}
          >
            <Calendar className="w-4 h-4 text-blue-200 flex-shrink-0" />
            <div>
              <span className="text-sm font-semibold text-white/90">
                {formatDate(today)}
              </span>
              <p className="text-white/55 text-xs">{formatTamil(today)}</p>
            </div>
          </div>
        </div>

        {/* Stats Row — 3D tilt */}
        <div className="px-4 -mt-4">
          <div
            className="grid grid-cols-3 gap-3"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={tiltStyle}
          >
            {[
              {
                label: "Students",
                labelTa: "மாணவர்",
                value: studentsLoading ? "…" : students.length,
                icon: Users,
              },
              {
                label: "Today",
                labelTa: "இன்று",
                value: todaySessionsCount,
                icon: Clock,
              },
              {
                label: "Total",
                labelTa: "மொத்தம்",
                value: sessions.length,
                icon: Calendar,
              },
            ].map(({ label, labelTa, value, icon: Icon }) => (
              <GlassCard key={label} className="p-3 text-center">
                <Icon className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {value}
                </p>
                <p className="text-xs text-white/60">{label}</p>
                <p className="text-xs text-white/35">{labelTa}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Mark Attendance CTA */}
        <div className="px-4 mt-6">
          <button
            type="button"
            data-ocid="teacher.mark_attendance_button"
            onClick={() => setScreen("camera")}
            className="btn-gradient animate-pulse-glow w-full h-16 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <Camera className="w-6 h-6" />
            <span>Mark Attendance</span>
            <span className="text-white/65 text-sm font-normal ml-1">
              வகுப்பு பதிவு
            </span>
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="px-4 mt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Recent Sessions
            </h2>
            <button
              type="button"
              className="text-blue-300 text-sm flex items-center gap-1 hover:text-blue-200 transition-colors"
              onClick={() => setScreen("sessions")}
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded-xl bg-white/10"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div
              data-ocid="teacher.sessions.empty_state"
              className="text-center py-12"
            >
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No sessions yet</p>
              <p className="text-xs text-white/30 mt-1">
                இன்னும் வகுப்பு மேற்கொளளவில்ளை
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...sessions]
                .reverse()
                .slice(0, 10)
                .map((session: AttendanceSession, idx: number) => (
                  <GlassCard
                    key={String(session.id)}
                    hover
                    className="flex items-center gap-3 p-3 animate-slide-in-up opacity-0"
                    data-ocid={`teacher.session.item.${idx + 1}`}
                    style={
                      {
                        animationDelay: `${idx * 0.05}s`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                      {session.photoUrl ? (
                        <img
                          src={session.photoUrl}
                          alt="Session"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white">
                        {session.date}
                      </p>
                      <p className="text-xs text-white/50">
                        {new Date(
                          Number(session.timestamp) / 1_000_000,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0 bg-white/10 text-white/70 border-white/10"
                    >
                      {new Date(
                        Number(session.timestamp) / 1_000_000,
                      ).toLocaleDateString()}
                    </Badge>
                  </GlassCard>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
