// ═══════════════════════════════════════
// XPMT — Tasks Hook
// ═══════════════════════════════════════

import { useState, useCallback } from "react";
import { call } from "./useInvoke";
import { Task, CreateTask, UpdateTask } from "../types";

export function useTasks(projectId: string) {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await call<Task[]>("get_tasks", { projectId });
      setTasks(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = async (input: CreateTask) => {
    try {
      const task = await call<Task>("create_task", { input });
      setTasks(prev => [...prev, task]);
      return task;
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const updateTask = async (id: string, input: UpdateTask) => {
    try {
      const updated = await call<Task>("update_task", { id, input });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await call("delete_task", { id });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const moveTask = async (id: string, status: string) => {
    return updateTask(id, { status });
  };

  return {
    tasks, loading, error,
    fetchTasks, createTask,
    updateTask, deleteTask, moveTask
  };
}
