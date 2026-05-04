// context/AuthContext.tsx
import { registerForPushNotificationsAsync, saveExpoPushToken } from "@/lib/push-notifications";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

export type Profile = {
  id: string;         // auth UUID
  user_id: number;    // integer FK used by pins, tags, lists, etc.
  username: string;
  avatar_key: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

let isUpdatingPassword = false;

export const setPasswordUpdateFlag = (value: boolean) => {
  isUpdatingPassword = value;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, username, avatar_key")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        registerPushToken(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (isUpdatingPassword) return;

      if (isUpdatingPassword && event !== "SIGNED_OUT") return;

      if (event === "SIGNED_OUT") {
        setProfile(null);
        return;
      }

      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        registerPushToken(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const registerPushToken = async (userId: string) => {
    const token = await registerForPushNotificationsAsync();
    if (token) await saveExpoPushToken(userId, token);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userId = currentSession?.user?.id;
    if (!userId) return;
    const p = await fetchProfile(userId);
    setProfile(p);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
