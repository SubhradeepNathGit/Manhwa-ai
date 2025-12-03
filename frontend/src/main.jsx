import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(

    <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* 👇 2. Wrap the Router with AuthProvider */}
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>

);
