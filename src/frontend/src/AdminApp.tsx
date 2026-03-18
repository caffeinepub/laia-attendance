import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import AdminOverview from "./admin/AdminOverview";
import AdminSessions from "./admin/AdminSessions";
import AdminStudents from "./admin/AdminStudents";
import AdminTeachers from "./admin/AdminTeachers";
import AdminVillages from "./admin/AdminVillages";
import FountainBackground from "./components/FountainBackground";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Page = "overview" | "villages" | "students" | "teachers" | "sessions";

const NAV_ITEMS = [
  { id: "overview" as Page, label: "Overview", icon: LayoutDashboard },
  { id: "villages" as Page, label: "Villages", icon: MapPin },
  { id: "students" as Page, label: "Students", icon: Users },
  { id: "teachers" as Page, label: "Teachers", icon: UserCheck },
  { id: "sessions" as Page, label: "Sessions", icon: Camera },
];

export default function AdminApp() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [page, setPage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const ActivePage = {
    overview: AdminOverview,
    villages: AdminVillages,
    students: AdminStudents,
    teachers: AdminTeachers,
    sessions: AdminSessions,
  }[page];

  return (
    <div
      className="min-h-screen flex relative"
      style={{ background: "oklch(0.10 0.05 265)" }}
    >
      <FountainBackground />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, oklch(0.22 0.12 265 / 0.4) 0%, transparent 60%)",
          zIndex: 1,
        }}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "oklch(0.08 0.055 268)",
          borderRight: "1px solid oklch(1 0 0 / 0.08)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="p-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(0.45 0.18 255 / 0.30)",
              border: "1px solid oklch(1 0 0 / 0.15)",
            }}
          >
            <img
              src="/assets/uploads/Screenshot_20260314_072139-1.jpg"
              alt="LAIA"
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
          <div>
            <p
              className="font-bold text-sm text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              LAIA Foundation
            </p>
            <p className="text-xs text-white/45">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                type="button"
                data-ocid={`nav.${item.id}_link`}
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active
                    ? "linear-gradient(135deg, oklch(0.38 0.20 265), oklch(0.56 0.18 240))"
                    : "transparent",
                  color: active ? "white" : "oklch(0.70 0.05 265)",
                  boxShadow: active
                    ? "0 4px 16px oklch(0.32 0.16 265 / 0.4)"
                    : "none",
                }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          className="p-3"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <button
            type="button"
            data-ocid="auth.logout_button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
            style={{ color: "oklch(0.65 0.05 265)" }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div
        className="flex-1 flex flex-col min-w-0 relative"
        style={{ zIndex: 2 }}
      >
        {/* Mobile header */}
        <header
          className="sticky top-0 h-14 flex items-center gap-3 px-4 lg:hidden z-10"
          style={{
            background: "oklch(0.08 0.055 268 / 0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid oklch(1 0 0 / 0.08)",
          }}
        >
          <button
            type="button"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1
            className="font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {NAV_ITEMS.find((n) => n.id === page)?.label}
          </h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <ActivePage />
        </main>
      </div>
    </div>
  );
}
