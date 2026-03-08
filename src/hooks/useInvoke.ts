// ═══════════════════════════════════════
// XPMT — Tauri Invoke Helper Hook
// ═══════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useInvoke<T>(
  command: string,
  args?: Record<string, unknown>
) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<T>(command, args);
      setData(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [command, JSON.stringify(args)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function call<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  return invoke<T>(command, args);
}
