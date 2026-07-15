import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ConsultantLink } from '../types';
import { getConsultantLinkBySlug } from '../services/consultantLinkService';

const STORAGE_KEY = 'realportal.activeConsultantLinkSlug';

interface ConsultantLinkContextValue {
  activeLink: ConsultantLink | null;
  loading: boolean;
}

const ConsultantLinkContext = createContext<ConsultantLinkContextValue>({
  activeLink: null,
  loading: false,
});

export function ConsultantLinkProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const [activeLink, setActiveLink] = useState<ConsultantLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const slug = refFromUrl ?? sessionStorage.getItem(STORAGE_KEY);

    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getConsultantLinkBySlug(slug).then((link) => {
      if (cancelled) return;
      if (link) {
        sessionStorage.setItem(STORAGE_KEY, slug);
        setActiveLink(link);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('ref')]);

  return (
    <ConsultantLinkContext.Provider value={{ activeLink, loading }}>
      {children}
    </ConsultantLinkContext.Provider>
  );
}

export function useConsultantLink(): ConsultantLinkContextValue {
  return useContext(ConsultantLinkContext);
}
