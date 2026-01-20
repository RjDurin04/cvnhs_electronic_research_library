import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize offline icon support
import { initializeOfflineIcons } from "@/lib/iconify-offline";
initializeOfflineIcons();

createRoot(document.getElementById("root")!).render(<App />);
