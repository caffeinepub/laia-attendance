import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Village } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function AdminVillages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: villages = [], isLoading } = useQuery({
    queryKey: ["allVillages"],
    queryFn: () => actor!.getAllVillages(),
    enabled: !!actor,
  });

  const handleCreate = async () => {
    if (!name.trim() || !actor) return;
    setSaving(true);
    try {
      const res = await actor.createVillage(name.trim());
      if (res.__kind__ === "ok") {
        toast.success("Village created");
        queryClient.invalidateQueries({ queryKey: ["allVillages"] });
        setName("");
        setOpen(false);
      } else {
        toast.error(res.err);
      }
    } catch {
      toast.error("Failed to create village");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Villages</h1>
          <p className="text-muted-foreground text-sm">
            Manage tuition centers
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="admin.create_village_button" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Village
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="admin.create_village_dialog">
            <DialogHeader>
              <DialogTitle>Add Village</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Village Name</Label>
                <Input
                  data-ocid="admin.create_village_input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Thanjavur Center"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="admin.create_village_cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !name.trim()}
                data-ocid="admin.create_village_submit_button"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Village
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : villages.length === 0 ? (
        <div
          data-ocid="admin.villages.empty_state"
          className="text-center py-16 bg-muted/30 rounded-xl"
        >
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No villages yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add a village to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {villages.map((v: Village, idx: number) => (
            <Card
              data-ocid={`admin.village_item.${idx + 1}`}
              key={String(v.id)}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {v.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ID: {String(v.id)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
