import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Camera, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useState } from "react";
import type {
  AttendanceRecord,
  AttendanceSession,
  Village,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function AdminSessions() {
  const { actor } = useActor();
  const [villageFilter, setVillageFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: villages = [] } = useQuery({
    queryKey: ["allVillages"],
    queryFn: () => actor!.getAllVillages(),
    enabled: !!actor,
  });

  const { data: allSessions = [], isLoading } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => actor!.getAllSessions(),
    enabled: !!actor,
  });

  const filteredSessions =
    villageFilter === "all"
      ? allSessions
      : allSessions.filter(
          (s: AttendanceSession) => String(s.villageId) === villageFilter,
        );

  const getVillageName = (id: bigint) =>
    (villages as Village[]).find((v) => String(v.id) === String(id))?.name ??
    "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm">
            All attendance sessions
          </p>
        </div>
        <Select value={villageFilter} onValueChange={setVillageFilter}>
          <SelectTrigger
            data-ocid="admin.sessions.village_select"
            className="w-44"
          >
            <SelectValue placeholder="All Villages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Villages</SelectItem>
            {(villages as Village[]).map((v: Village) => (
              <SelectItem key={String(v.id)} value={String(v.id)}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div
          data-ocid="admin.sessions.empty_state"
          className="text-center py-16 bg-muted/30 rounded-xl"
        >
          <Camera className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...filteredSessions]
            .reverse()
            .map((session: AttendanceSession, idx: number) => (
              <SessionCard
                key={String(session.id)}
                session={session}
                villageName={getVillageName(session.villageId)}
                isExpanded={expandedId === String(session.id)}
                onToggle={() =>
                  setExpandedId(
                    expandedId === String(session.id)
                      ? null
                      : String(session.id),
                  )
                }
                actor={actor}
                ocid={`admin.session_item.${idx + 1}`}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  villageName,
  isExpanded,
  onToggle,
  actor,
  ocid,
}: {
  session: AttendanceSession;
  villageName: string;
  isExpanded: boolean;
  onToggle: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: dynamic actor type
  actor: any;
  ocid: string;
}) {
  const { data: records = [] } = useQuery({
    queryKey: ["sessionRecords", String(session.id)],
    queryFn: () => actor!.getSessionRecords(session.id),
    enabled: !!actor && isExpanded,
  });

  const presentCount = (records as AttendanceRecord[]).filter(
    (r) => r.status === "present",
  ).length;
  const absentCount = (records as AttendanceRecord[]).filter(
    (r) => r.status === "absent",
  ).length;

  return (
    <Card data-ocid={ocid} className="overflow-hidden">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {session.photoUrl ? (
              <img
                src={session.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{session.date}</p>
              <Badge variant="secondary" className="text-xs">
                {villageName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(
                Number(session.timestamp) / 1_000_000,
              ).toLocaleTimeString()}
            </p>
            {records.length > 0 && (
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-green-600 font-medium">
                  {presentCount} present
                </span>
                <span className="text-xs text-red-500 font-medium">
                  {absentCount} absent
                </span>
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {isExpanded && records.length > 0 && (
          <div className="border-t px-4 py-3 space-y-1 bg-muted/20">
            {(records as AttendanceRecord[]).map((r, i) => (
              <div
                key={`${String(r.studentId)}-${i}`}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">Student {String(r.studentId)}</span>
                </div>
                <Badge
                  variant={r.status === "present" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
