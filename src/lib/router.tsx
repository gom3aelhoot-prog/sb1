import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type RouterContextType = {
  path: string;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname + window.location.search);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function parseQuery(path: string): Record<string, string> {
  const queryIndex = path.indexOf('?');
  if (queryIndex === -1) return {};
  const params = new URLSearchParams(path.substring(queryIndex));
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function getPathOnly(path: string): string {
  const queryIndex = path.indexOf('?');
  return queryIndex === -1 ? path : path.substring(0, queryIndex);
}
