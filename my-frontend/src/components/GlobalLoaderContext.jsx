import React, { createContext, useContext, useState, useCallback } from "react";

// Create the context
const LoaderContext = createContext({
  show: () => {},
  hide: () => {},
  loading: false
});

// Provider component
export function GlobalLoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const show = useCallback(() => setLoading(true), []);
  const hide = useCallback(() => setLoading(false), []);

  return (
    <LoaderContext.Provider value={{ show, hide, loading }}>
      {children}
      {/* Emoji spinner, full-screen */}
      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            fontSize: 70,
            animation: "spin-loader 1.2s linear infinite"
          }}>
            <span role="img" aria-label="loading">🧑🏻‍💻</span>
          </div>
          <style>{`
            @keyframes spin-loader {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}
    </LoaderContext.Provider>
  );
}

// Hook to use in your components
export const useGlobalLoader = () => useContext(LoaderContext);
