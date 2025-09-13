import { useState, useEffect } from "react";
import { App } from "./App";
import { Daily } from "./Daily";

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Make navigate available globally for components to use
  (window as any).navigate = navigate;

  switch (currentPath) {
    case '/daily':
      return <Daily />;
    case '/':
    default:
      return <App />;
  }
}
