"use client";

import { useState, useEffect } from "react";

export function useAIAvailability() {
  const [aiAvailable, setAiAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        setAiAvailable(data.available === true);
      })
      .catch(() => {
        setAiAvailable(false);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  return { aiAvailable, isChecking };
}
