import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronLeft, Loader2, Search, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AttendanceInput, Student } from "./backend.d";
import GlassCard from "./components/GlassCard";
import { useActor } from "./hooks/useActor";

interface Props {
  students: Student[];
  photoUrl: string;
  villageName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

type Status = "present" | "absent";

export default function AttendanceForm({
  students,
  photoUrl,
  villageName,
  onSubmitted,
  onCancel,
}: Props) {
  const { actor } = useActor();
  const [search, setSearch] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, Status>>(() => {
    const m: Record<string, Status> = {};
    for (const s of students) m[String(s.id)] = "present";
    return m;
  });
  const [submitting, setSubmitting] = useState(false);
  const [flipping, setFlipping] = useState<Record<string, boolean>>({});
  const [showSparkles, setShowSparkles] = useState(false);
  const sparkleContainerRef = useRef<HTMLDivElement>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()),
  );

  const presentCount = Object.values(statusMap).filter(
    (v) => v === "present",
  ).length;
  const absentCount = Object.values(statusMap).filter(
    (v) => v === "absent",
  ).length;

  const toggle = (id: bigint) => {
    const key = String(id);
    setFlipping((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setFlipping((prev) => ({ ...prev, [key]: false }));
    }, 350);
    setStatusMap((prev) => ({
      ...prev,
      [key]: prev[key] === "present" ? "absent" : "present",
    }));
  };

  const triggerSparkles = () => {
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 900);
  };

  const handleSubmit = async () => {
    if (!actor) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const records: AttendanceInput[] = students.map((s) => ({
        studentId: s.id,
        status: statusMap[String(s.id)] ?? "absent",
      }));
      const result = await actor.submitAttendance(today, photoUrl, records);
      if (result.__kind__ === "ok") {
        triggerSparkles();
        toast.success("வகுப்பு பதிவு சேமிக்கப்பட்டது / Attendance submitted");
        setTimeout(() => onSubmitted(), 800);
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const markAll = (status: Status) => {
    const m: Record<string, Status> = {};
    for (const s of students) m[String(s.id)] = status;
    setStatusMap(m);
  };

  // Sparkle dots
  const sparklePositions = [
    { x: "20%", y: "30%" },
    { x: "50%", y: "15%" },
    { x: "80%", y: "25%" },
    { x: "15%", y: "60%" },
    { x: "85%", y: "55%" },
    { x: "40%", y: "70%" },
    { x: "65%", y: "80%" },
    { x: "30%", y: "85%" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col max-w-lg mx-auto relative"
      style={{ background: "oklch(0.10 0.05 265)" }}
    >
      {/* Sparkle overlay */}
      {showSparkles && (
        <div
          ref={sparkleContainerRef}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 100 }}
        >
          {sparklePositions.map((pos, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: sparkle positions are stable
              key={i}
              className="sparkle-dot"
              style={{
                left: pos.x,
                top: pos.y,
                animationDelay: `${i * 0.07}s`,
                width: 6 + Math.random() * 8,
                height: 6 + Math.random() * 8,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div
        className="px-4 pt-4 pb-4"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.22 0.14 265) 0%, oklch(0.38 0.18 250) 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1
              className="font-bold text-lg text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Mark Attendance
            </h1>
            <p className="text-white/60 text-xs">
              {villageName} &bull; {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/25">
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Present / உள்ளூர்",
              value: presentCount,
              color: "oklch(0.56 0.18 240 / 0.25)",
            },
            {
              label: "Absent / இல்லை",
              value: absentCount,
              color: "oklch(0.55 0.22 25 / 0.25)",
            },
            {
              label: "Total / மொத்தம்",
              value: students.length,
              color: "oklch(1 0 0 / 0.10)",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-2 text-center"
              style={{
                background: color,
                border: "1px solid oklch(1 0 0 / 0.12)",
              }}
            >
              <p
                className="font-bold text-xl text-white"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {value}
              </p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mark All */}
      <div
        className="px-4 py-3 flex gap-2"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <button
          type="button"
          onClick={() => markAll("present")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-all"
          style={{
            background: "oklch(0.45 0.18 240 / 0.30)",
            border: "1px solid oklch(0.56 0.18 240 / 0.35)",
          }}
        >
          <Check className="w-3 h-3" /> All Present
        </button>
        <button
          type="button"
          onClick={() => markAll("absent")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-all"
          style={{
            background: "oklch(0.55 0.22 25 / 0.25)",
            border: "1px solid oklch(0.55 0.22 25 / 0.35)",
          }}
        >
          <X className="w-3 h-3" /> All Absent
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            data-ocid="teacher.attendance_search_input"
            placeholder="Search students... / மாணவர் தேடு"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/35 outline-none transition-all"
            style={{
              background: "oklch(1 0 0 / 0.07)",
              border: "1px solid oklch(1 0 0 / 0.12)",
            }}
          />
        </div>
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No students found</p>
          </div>
        ) : (
          filtered.map((student, idx) => {
            const status = statusMap[String(student.id)] ?? "present";
            const isPresent = status === "present";
            const isFlipping = flipping[String(student.id)];
            return (
              <button
                type="button"
                data-ocid={`teacher.student_toggle.${idx + 1}`}
                key={String(student.id)}
                onClick={() => toggle(student.id)}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 border-2 text-left transition-all duration-300 active:scale-[0.98] ${
                  isPresent ? "border-blue-500/40" : "border-red-500/30"
                } ${isFlipping ? "animate-card-flip" : ""}`}
                style={{
                  background: isPresent
                    ? "oklch(0.45 0.18 240 / 0.15)"
                    : "oklch(0.55 0.22 25 / 0.12)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: isPresent
                      ? "oklch(0.56 0.18 240 / 0.30)"
                      : "oklch(0.55 0.22 25 / 0.25)",
                    color: isPresent
                      ? "oklch(0.80 0.10 240)"
                      : "oklch(0.80 0.12 25)",
                  }}
                >
                  {student.rollNo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-white/45">
                    செயல்ந். {student.rollNo}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: isPresent
                      ? "oklch(0.56 0.18 240 / 0.40)"
                      : "oklch(0.55 0.22 25 / 0.50)",
                    color: "white",
                  }}
                >
                  {isPresent ? (
                    <>
                      <Check className="w-3 h-3" /> <span>உள்ளூர்</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> <span>இல்லை</span>
                    </>
                  )}
                </div>
              </button>
            );
          })
        )}
        <div className="h-28" />
      </div>

      {/* Submit bar */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4"
        style={{
          background: "oklch(0.10 0.05 265 / 0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid oklch(1 0 0 / 0.08)",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          data-ocid="teacher.submit_attendance_button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-gradient animate-pulse-glow w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" /> Submit Attendance / பதிவு செய்
            </>
          )}
        </button>
      </div>
    </div>
  );
}
