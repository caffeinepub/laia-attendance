import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Principal } from "@dfinity/principal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AttendanceSession, TeacherProfile, Village } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function AdminTeachers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    principalId: "",
    villageId: "",
    name: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: villages = [] } = useQuery({
    queryKey: ["allVillages"],
    queryFn: () => actor!.getAllVillages(),
    enabled: !!actor,
  });

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["allTeachers"],
    queryFn: () => actor!.getTeachers(),
    enabled: !!actor,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => actor!.getAllSessions(),
    enabled: !!actor,
  });

  const handleAssign = async () => {
    if (
      !form.principalId.trim() ||
      !form.villageId ||
      !form.name.trim() ||
      !actor
    )
      return;
    setSaving(true);
    try {
      const principal = Principal.fromText(form.principalId.trim());
      const res = await actor.assignTeacher(
        principal,
        BigInt(form.villageId),
        form.name.trim(),
        form.email.trim(),
      );
      if (res.__kind__ === "ok") {
        toast.success("Teacher assigned");
        queryClient.invalidateQueries({ queryKey: ["allTeachers"] });
        setForm({ principalId: "", villageId: "", name: "", email: "" });
        setOpen(false);
      } else {
        toast.error(res.err);
      }
    } catch {
      toast.error("Invalid Principal ID or request failed");
    } finally {
      setSaving(false);
    }
  };

  const getVillageName = (id: bigint) =>
    (villages as Village[]).find((v) => String(v.id) === String(id))?.name ??
    "-";
  const getSessionCount = (userId: string) =>
    (sessions as AttendanceSession[]).filter(
      (s) => s.teacherId.toString() === userId,
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Teachers</h1>
          <p className="text-muted-foreground text-sm">
            Assign teacher logins to villages
          </p>
        </div>
        <Button
          data-ocid="admin.assign_teacher_button"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Assign Teacher
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div
          data-ocid="admin.teachers.empty_state"
          className="text-center py-16 bg-muted/30 rounded-xl"
        >
          <UserCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No teachers assigned yet</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(teachers as TeacherProfile[]).map((t, idx) => (
                <TableRow
                  data-ocid={`admin.teacher_item.${idx + 1}`}
                  key={t.userId.toString()}
                >
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {t.email || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getVillageName(t.villageId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {getSessionCount(t.userId.toString())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.assign_teacher_dialog">
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Principal ID</Label>
              <Input
                data-ocid="admin.assign_teacher_principal_input"
                value={form.principalId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, principalId: e.target.value }))
                }
                placeholder="xxxx-xxxx-..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Teacher's Internet Identity principal
              </p>
            </div>
            <div>
              <Label>Village</Label>
              <Select
                value={form.villageId}
                onValueChange={(v) => setForm((f) => ({ ...f, villageId: v }))}
              >
                <SelectTrigger data-ocid="admin.assign_teacher_village_select">
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {(villages as Village[]).map((v) => (
                    <SelectItem key={String(v.id)} value={String(v.id)}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Teacher Name</Label>
              <Input
                data-ocid="admin.assign_teacher_name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input
                data-ocid="admin.assign_teacher_email_input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="teacher@example.com"
                type="email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="admin.assign_teacher_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                saving || !form.principalId || !form.villageId || !form.name
              }
              data-ocid="admin.assign_teacher_submit_button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
