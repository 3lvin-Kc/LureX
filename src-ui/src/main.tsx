import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

async function initializeApp() {
  // Render immediately; do not block on IPC globals
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
});
