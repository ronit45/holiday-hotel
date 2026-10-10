import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AppContextProvider } from "./contexts/AppContext.jsx";
import { SearchContextProvider } from "./contexts/SearchContext.jsx";

if (import.meta.env.MODE !== "test") {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <AppContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AppContextProvider>
    </React.StrictMode>
  );
}
