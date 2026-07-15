import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CompareContextValue {
  comparedIds: string[];
  isCompared: (id: string) => boolean;
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

const MAX_COMPARE = 2;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const isCompared = useCallback((id: string) => comparedIds.includes(id), [comparedIds]);

  /** Returns true once the second property has just been added (caller should navigate to /compare). */
  const addToCompare = useCallback(
    (id: string) => {
      let becameFull = false;
      setComparedIds((prev) => {
        if (prev.includes(id) || prev.length >= MAX_COMPARE) return prev;
        const next = [...prev, id];
        becameFull = next.length === MAX_COMPARE;
        return next;
      });
      return becameFull;
    },
    [],
  );

  const removeFromCompare = useCallback((id: string) => {
    setComparedIds((prev) => prev.filter((existing) => existing !== id));
  }, []);

  const clearCompare = useCallback(() => setComparedIds([]), []);

  const value = useMemo(
    () => ({ comparedIds, isCompared, addToCompare, removeFromCompare, clearCompare }),
    [comparedIds, isCompared, addToCompare, removeFromCompare, clearCompare],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
