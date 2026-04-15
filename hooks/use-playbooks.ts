"use client";

import { useCallback, useEffect, useState } from "react";
import { Playbook, PlaybookFormData } from "@/lib/types";
import * as store from "@/lib/store";
import { getSeedPlaybooks } from "@/lib/seed-data";
import { STORAGE_KEYS } from "@/lib/constants";

export function usePlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    // Seed on first visit
    if (!store.isSeeded()) {
      const seeds = getSeedPlaybooks();
      const current = store.getPlaybooks();
      if (current.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(seeds));
      }
      store.markSeeded();
    }
    setPlaybooks(store.getPlaybooks());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    (data: PlaybookFormData, userId: string) => {
      const playbook = store.createPlaybook(data, userId);
      load();
      return playbook;
    },
    [load]
  );

  const update = useCallback(
    (
      id: string,
      data: Partial<PlaybookFormData>,
      userId: string,
      changeDescription?: string
    ) => {
      const playbook = store.updatePlaybook(id, data, userId, changeDescription);
      load();
      return playbook;
    },
    [load]
  );

  const remove = useCallback(
    (id: string) => {
      const success = store.deletePlaybook(id);
      if (success) load();
      return success;
    },
    [load]
  );

  const restore = useCallback(
    (playbookId: string, versionId: string, userId: string) => {
      const playbook = store.restoreVersion(playbookId, versionId, userId);
      load();
      return playbook;
    },
    [load]
  );

  return {
    playbooks,
    isLoading,
    create,
    update,
    remove,
    restore,
    reload: load,
  };
}
