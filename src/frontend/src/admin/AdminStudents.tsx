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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Student, Village } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function AdminStudents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [villageFilter, setVillageFilter] = useState("all");
  const [form, setForm] = useState({ name: "", rollNo: "", villageId: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: villages = [] } = useQuery({
    queryKey: ["allVillages"],
    queryFn: () => actor!.getAllVillages(),
    enabled: !!actor,
  });

  const selectedVillageId =
    villageFilter !== "all" ? BigInt(villageFilter) : null;

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", villageFilter],
    queryFn: () =>
      selectedVillageId
        ? actor!.getStudents(selectedVillageId)
        : Promise.all(
            (villages as Village[]).map((v) => actor!.getStudents(v.id)),
          ).then((arrs) => arrs.flat()),
    enabled: !!actor && (villageFilter === "all" ? villages.length > 0 : true),
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.rollNo.trim() || !form.villageId || !actor)
      return;
    setSaving(true);
    try {
      const res = await actor.addStudent(
        BigInt(form.villageId),
        form.name.trim(),
        form.rollNo.trim(),
      );
      if (res.__kind__ === "ok") {
        toast.success("Student added");
        queryClient.invalidateQueries({ queryKey: ["students"] });
        setForm({ name: "", rollNo: "", villageId: "" });
        setOpen(false);
      } else {
        toast.error(res.err);
      }
    } catch {
      toast.error("Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeleting(String(id));
    try {
      const res = await actor.deleteStudent(id);
      if (res.__kind__ === "ok") {
        toast.success("Student removed");
        queryClient.invalidateQueries({ queryKey: ["students"] });
      } else {
        toast.error(res.err);
      }
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleting(null);
    }
  };

  const getVillageName = (id: bigint) =>
    (villages as Village[]).find((v) => String(v.id) === String(id))?.name ??
    "-";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Students</h1>
          <p className="text-muted-foreground text-sm">
            Manage students per village
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={villageFilter} onValueChange={setVillageFilter}>
            <SelectTrigger
              data-ocid="admin.students.village_select"
              className="w-44"
            >
              <SelectValue placeholder="All Villages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {(villages as Village[]).map((v) => (
                <SelectItem key={String(v.id)} value={String(v.id)}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            data-ocid="admin.add_student_button"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div
          data-ocid="admin.students.empty_state"
          className="text-center py-16 bg-muted/30 rounded-xl"
        >
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No students yet</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Village</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(students as Student[]).map((s, idx) => (
                <TableRow
                  data-ocid={`admin.student_item.${idx + 1}`}
                  key={String(s.id)}
                >
                  <TableCell className="font-mono text-sm">
                    {s.rollNo}
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {getVillageName(s.villageId)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={s.isActive ? "default" : "secondary"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      data-ocid={`admin.student_delete_button.${idx + 1}`}
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deleting === String(s.id)}
                      onClick={() => handleDelete(s.id)}
                    >
                      {deleting === String(s.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.add_student_dialog">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Village</Label>
              <Select
                value={form.villageId}
                onValueChange={(v) => setForm((f) => ({ ...f, villageId: v }))}
              >
                <SelectTrigger data-ocid="admin.add_student_village_select">
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
              <Label>Student Name</Label>
              <Input
                data-ocid="admin.add_student_name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Roll Number</Label>
              <Input
                data-ocid="admin.add_student_roll_input"
                value={form.rollNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rollNo: e.target.value }))
                }
                placeholder="e.g., 001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="admin.add_student_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || !form.name.trim() || !form.villageId}
              data-ocid="admin.add_student_submit_button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
