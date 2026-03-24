
// src/components/auth/auth-provider.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import FirebaseErrorListener from './firebase-error-listener';


interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

async function getRoleFromToken(user: User): Promise<UserRole> {
    try {
        const idTokenResult = await getIdTokenResult(user, true); // Force refresh
        const claims = idTokenResult.claims;

        if (claims.admin) {
            return 'admin';
        }
        if (claims.manager) {
            return 'manager';
        }
        return 'employee';
    } catch (error) {
        console.error("Error getting user role from token:", error);
        return 'employee'; // Fallback to least privileged role
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRole = await getRoleFromToken(user);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);

    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && isPublic) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
}
