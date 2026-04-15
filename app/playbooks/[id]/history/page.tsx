"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { Playbook, PlaybookVersion } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { VersionHistoryList } from "@/components/playbook/version-history-list";
import { VersionDiff } from "@/components/playbook/version-diff";
import { MarkdownPreview } from "@/components/playbook/preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, GitCompare, FileText } from "lucide-react";
import * as store from "@/lib/store";

export default function VersionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, canEdit } = useAuth();
  const { restore } = usePlaybooks();

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [versions, setVersions] = useState<PlaybookVersion[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<PlaybookVersion | null>(null);
  const [viewTab, setViewTab] = useState<string>("diff");
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const pb = store.getPlaybook(id);
    if (pb) {
      setPlaybook(pb);
      const versionList = store.getVersions(id);
      setVersions(versionList);
      if (versionList.length > 0) {
        setSelectedVersion(versionList[0]);
      }
    }
    setIsLoading(false);
  }, [id]);

  const handleRestore = (version: PlaybookVersion) => {
    if (!user) return;
    const result = restore(id, version.id, user.id);
    if (result) {
      router.push(`/playbooks/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  if (!playbook) {
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
        title="Version History"
        description={playbook.title}
      >
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </Topbar>

      <div className="flex flex-1 overflow-hidden">
        {/* Version list sidebar */}
        <div className="w-80 shrink-0 overflow-auto border-r p-4">
          <h3 className="mb-3 text-sm font-semibold">
            Versions ({versions.length})
          </h3>
          <VersionHistoryList
            versions={versions}
            selectedId={selectedVersion?.id}
            onSelect={setSelectedVersion}
            onRestore={handleRestore}
            canRestore={canEdit}
          />
        </div>

        {/* Diff / Preview panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedVersion ? (
            <>
              <div className="border-b px-4 py-2">
                <Tabs value={viewTab} onValueChange={setViewTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="diff" className="h-6 px-3 text-xs">
                      <GitCompare className="mr-1 h-3 w-3" />
                      Diff
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="h-6 px-3 text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-hidden">
                {viewTab === "diff" ? (
                  <VersionDiff
                    oldContent={selectedVersion.content}
                    newContent={playbook.content}
                  />
                ) : (
                  <MarkdownPreview content={selectedVersion.content} />
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Select a version to view changes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
