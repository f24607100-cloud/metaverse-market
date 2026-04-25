import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export type AppUserRole = "seller" | "client";

export type AppUserProfile = {
  role: AppUserRole;
  email?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export async function upsertUserRole(input: {
  uid: string;
  role: AppUserRole;
  email?: string | null;
  extra?: Record<string, unknown>;
}) {
  const ref = doc(db, "users", input.uid);
  await setDoc(
    ref,
    {
      role: input.role,
      email: input.email ?? null,
      ...input.extra,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserRole(uid: string): Promise<AppUserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const role = snap.data()?.role;
  return role === "seller" || role === "client" ? role : null;
}

export function subscribeUserRole(
  uid: string,
  callback: (role: AppUserRole | null) => void
) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const role = snap.data()?.role;
    callback(role === "seller" || role === "client" ? role : null);
  });
}
