"use client";

import { getCurrentAdmin, onAuthStateChange } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check initial session
    getCurrentAdmin()
      .then((user) => {
        setUser(user);
        setLoading(false);

        // Redirect logic
        if (!user && pathname !== "/login") {
          router.push("/login");
        } else if (user && pathname === "/login") {
          router.push("/dashboard");
        }
      })
      .catch(() => {
        setLoading(false);
        if (pathname !== "/login") {
          router.push("/login");
        }
      });

    // Listen to auth changes
    const { data } = onAuthStateChange((user) => {
      setUser(user);
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/dashboard");
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">جارٍ التحميل...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
