import React from "react";
import { createRoot } from "react-dom/client"; // ✅ Use createRoot

import App from "./App";

// Get root element
const rootElement = document.getElementById("root");

// Create root and render
const root = createRoot(rootElement);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
