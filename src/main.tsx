import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import Home from "./pages/Home.tsx";
import GroupsPage from "./pages/Group.tsx";
import NotFoundPage from "./pages/Notfoundpage.tsx";
import GroupPage from "./pages/Group_page.tsx";
import { AuthProvider } from "./components/providers/auth.tsx";
import { ProtectedRoute } from "./components/protectedRoutes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <GroupPage params={{ groupId: "1" }} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
