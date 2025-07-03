import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { LeaderboardProvider } from "./contexts/LeaderboardContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LeaderboardProvider>
      <App />
    </LeaderboardProvider>
  </StrictMode>
);
