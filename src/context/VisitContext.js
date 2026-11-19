'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const VisitContext = createContext({ views: null, loading: true });

let cachedViews = null;
let fetchPromise = null;

export function VisitProvider({ children }) {
  const [views, setViews] = useState(cachedViews);
  const [loading, setLoading] = useState(cachedViews === null);

  useEffect(() => {
    let isMounted = true;

    async function loadViews() {
      if (cachedViews !== null) {
        if (isMounted) {
          setViews(cachedViews);
          setLoading(false);
        }
        return;
      }

      if (!fetchPromise) {
        fetchPromise = (async () => {
          try {
            const hasVisitedSession =
              typeof window !== 'undefined' && sessionStorage.getItem('visited_session');

            let res;
            if (hasVisitedSession) {
              res = await fetch('/api/views', { method: 'GET' });
            } else {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('visited_session', 'true');
              }
              res = await fetch('/api/views', { method: 'POST' });
            }

            const data = await res.json();
            if (data.count !== undefined) {
              cachedViews = data.count;
              return data.count;
            }
          } catch (err) {
            console.error('VisitContext fetch error:', err);
          }
          return 0;
        })();
      }

      const count = await fetchPromise;
      if (isMounted) {
        setViews(count);
        setLoading(false);
      }
    }

    loadViews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <VisitContext.Provider value={{ views, loading }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisitCount() {
  return useContext(VisitContext);
}
