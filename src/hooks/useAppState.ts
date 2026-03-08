// ═══════════════════════════════════════
// XPMT — Global App State Hook
// ═══════════════════════════════════════

import { useState, useEffect } from "react";
import { call } from "./useInvoke";

export interface AppState {
  isReady:     boolean;
  isSetupDone: boolean;
  userId:      string | null;
  workspaceId: string | null;
  spaceId:     string | null;
}

const STORAGE_KEY = "xpmt_session";

export function useAppState() {
  const [state, setState] = useState<AppState>({
    isReady:     false,
    isSetupDone: false,
    userId:      null,
    workspaceId: null,
    spaceId:     null,
  });

  useEffect(() => { checkSetup(); }, []);

  const checkSetup = async () => {
    try {
      // Check local session first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const done = await call<boolean>("is_setup_done");
        if (done) {
          setState({ isReady: true, isSetupDone: true, ...session });
          return;
        }
      }
      const done = await call<boolean>("is_setup_done");
      setState(s => ({ ...s, isReady: true, isSetupDone: done }));
    } catch {
      setState(s => ({ ...s, isReady: true, isSetupDone: false }));
    }
  };

  const completeSetup = (
    userId: string,
    workspaceId: string,
    spaceId: string
  ) => {
    const session = { userId, workspaceId, spaceId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setState({ isReady: true, isSetupDone: true, ...session });
  };

  return { state, completeSetup };
}
