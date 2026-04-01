"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  startTransition,
} from "react";

interface UserState {
  name: string;
  career: string | null;
  bracket: string | null;
  role: string;
  industry: string;
  jd: string;
  resume: string;
  onboarded: boolean;
}

interface UserContextType {
  user: UserState;
  updateUser: (data: Partial<UserState>) => void;
  resetUser: () => void;
}

const defaultUser: UserState = {
  name: "", // Default to empty
  career: null,
  bracket: null,
  role: "",
  industry: "",
  jd: "",
  resume: "",
  onboarded: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(defaultUser);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (deferred so SSR + first paint stay aligned)
  useEffect(() => {
    const saved = localStorage.getItem("proofdive_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserState;
        startTransition(() => setUser(parsed));
      } catch {
        /* ignore corrupt storage */
      }
    }
    startTransition(() => setIsLoaded(true));
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("proofdive_user", JSON.stringify(user));
    }
  }, [user, isLoaded]);

  const updateUser = (data: Partial<UserState>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const resetUser = () => {
    setUser(defaultUser);
    localStorage.removeItem("proofdive_user");
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
