// ═══════════════════════════════════════
// XPMT — Projects Hook
// ═══════════════════════════════════════

import { useState, useCallback } from "react";
import { call } from "./useInvoke";
import { Project, CreateProject } from "../types";

export function useProjects(spaceId: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!spaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await call<Project[]>("get_projects", { spaceId });
      setProjects(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  const createProject = async (input: CreateProject) => {
    try {
      const project = await call<Project>("create_project", { input });
      setProjects(prev => [project, ...prev]);
      return project;
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await call("delete_project", { id });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  return { projects, loading, error, fetchProjects, createProject, deleteProject };
}
