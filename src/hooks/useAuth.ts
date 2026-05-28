import { useState, useEffect } from 'react';
import { auth, signInAnonymously, onAuthStateChanged, User } from '@/src/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Se não houver sessão, autentica anonimamente
        signInAnonymously(auth).catch((error) => {
          console.error("Erro na autenticação anónima:", error);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}