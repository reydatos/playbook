"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { useDebounce } from "@/hooks/use-debounce";
import { Playbook, PlaybookFormData } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { MetadataForm } from "@/components/playbook/metadata-form";
import { EditorLayout } from "@/components/playbook/editor-layout";
import { DeleteDialog } from "@/components/playbook/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Trash2,
  History,
  CheckCircle,
  Loader2,
  Cloud,
} from "lucide-react";
import * as store from "@/lib/store";

type SaveStatus = "idle" | "saving" | "saved";

export default function PlaybookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, canEdit, canDelete } = useAuth();
  const { update, remove } = usePlaybooks();

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [formData, setFormData] = useState<PlaybookFormData | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  // Load playbook
  useEffect(() => {
    const pb = store.getPlaybook(id);
    if (pb) {
      setPlaybook(pb);
      setFormData({
        title: pb.title,
        description: pb.description,
        content: pb.content,
        category: pb.category,
        tags: pb.tags,
        status: pb.status,
      });
    }
    setIsLoading(false);
  }, [id]);

  // Autosave debounce
  const debouncedFormData = useDebounce(formData, 1500);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!debouncedFormData || !user || !playbook || !canEdit) return;

    const serialized = JSON.stringify(debouncedFormData);
    if (serialized === lastSavedRef.current) return;

    setSaveStatus("saving");
    const updated = update(playbook.id, debouncedFormData, user.id);
    if (updated) {
      setPlaybook(updated);
      lastSavedRef.current = serialized;
    }

    const timer = setTimeout(() => setSaveStatus("saved"), 500);
    return () => clearTimeout(timer);
  }, [debouncedFormData, user, playbook, canEdit, update]);

  // Reset saved indicator after 3s
  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleManualSave = () => {
    if (!formData || !user || !playbook || !canEdit) return;
    setSaveStatus("saving");
    const updated = update(playbook.id, formData, user.id, "Manual save");
    if (updated) {
      setPlaybook(updated);
      lastSavedRef.current = JSON.stringify(formData);
    }
    setTimeout(() => setSaveStatus("saved"), 500);
  };

  const handleDelete = () => {
    if (!playbook) return;
    remove(playbook.id);
    router.push("/dashboard");
  };

  const handleFormChange = (updates: Partial<PlaybookFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...updates } : prev));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading playbook...</div>
      </div>
    );
  }

  if (!playbook || !formData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Playbook not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar
        title={formData.title || "Untitled Playbook"}
        description={canEdit ? "Editing playbook" : "Viewing playbook (read-only)"}
      >
        <div className="flex items-center gap-2">
          {/* Save status indicator */}
          {canEdit && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
              {saveStatus === "idle" && (
                <>
                  <Cloud className="h-3 w-3" />
                  <span>Auto-save on</span>
                </>
              )}
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/playbooks/${id}/history`)}
          >
            <History className="mr-2 h-4 w-4" />
            History
            {playbook.versions.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {playbook.versions.length}
              </Badge>
            )}
          </Button>

          {canEdit && (
            <Button size="sm" onClick={handleManualSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}

          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </Topbar>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <MetadataForm
            data={formData}
            onChange={handleFormChange}
            readOnly={!canEdit}
          />
        </div>

        <div className="h-[600px]">
          <EditorLayout
            content={formData.content}
            onChange={(content) => handleFormChange({ content })}
            readOnly={!canEdit}
          />
        </div>
      </div>

      <DeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={playbook.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
