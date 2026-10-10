import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import * as apiClient from "../api-client";

import { toast as sonnerToast } from "sonner";
import { clearAuthStorage } from "../utils/auth-storage";

export const AppContext = React.createContext(undefined);
export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState(
    "Hotel room is getting ready..."
  );
  
  const hasStoredToken = typeof window !== "undefined" && !!localStorage.getItem("session_id");
  const [isLoggedIn, setIsLoggedIn] = useState(hasStoredToken);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      apiClient.fetchCurrentUser().then(setCurrentUser).catch(() => {});
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (hasStoredToken) {
      apiClient.validateToken()
        .then(() => setIsLoggedIn(true))
        .catch(() => {
          clearAuthStorage();
          setIsLoggedIn(false);
        });
    }
  }, [hasStoredToken]);

  const showToast = React.useCallback((toastMessage) => {
    const opts = { description: toastMessage.description };
    if (toastMessage.type === "SUCCESS") {
      sonnerToast.success(toastMessage.title, opts);
    } else if (toastMessage.type === "ERROR") {
      sonnerToast.error(toastMessage.title, opts);
    } else {
      sonnerToast.message(toastMessage.title, opts);
    }
  }, []);

  const showGlobalLoading = React.useCallback((message) => {
    if (message) setGlobalLoadingMessage(message);
    setIsGlobalLoading(true);
  }, []);

  const hideGlobalLoading = React.useCallback(() => {
    setIsGlobalLoading(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        showToast,
        isLoggedIn,
        currentUser,
        showGlobalLoading,
        hideGlobalLoading,
        isGlobalLoading,
        globalLoadingMessage,
      }}
    >
      {isGlobalLoading && <LoadingSpinner message={globalLoadingMessage} />}
      {children}
    </AppContext.Provider>
  );
};
