// ═══════════════════════════════════════
// XPMT — Users Hook
// ═══════════════════════════════════════

import { useState, useEffect } from "react";
import { call } from "./useInvoke";
import { User, CreateUser } from "../types";

export function useUsers() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await call<User[]>("get_users");
      setUsers(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (input: CreateUser) => {
    try {
      const user = await call<User>("create_user", { input });
      setUsers(prev => [...prev, user]);
      return user;
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await call("delete_user", { id });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(String(err));
      throw err;
    }
  };

  return { users, loading, error, fetchUsers, createUser, deleteUser };
}
