import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ThemeToggle from "./components/ui/ThemeToggle";  // ✅ default import

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeToggle />   {/* 💡 Render it outside <App> */}
    <App />
  </React.StrictMode>
);
