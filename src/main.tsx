import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/protectedRoutes.tsx";
import { AuthProvider } from "./components/providers/auth.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import RegisterServiceWorker from "./components/RegisterServiceWorker.tsx";
import "./index.css";
import GroupsPage from "./pages/Group.tsx";
import StudyGroupPage from "./pages/Group_page.tsx";
import Home from "./pages/Home.tsx";
import NotFoundPage from "./pages/Notfoundpage.tsx";
import { Toaster } from "sonner";
import CustomCursor from "./components/CustomCursor.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CustomCursor />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <RegisterServiceWorker />
                  <GroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <RegisterServiceWorker />
                  <StudyGroupPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster closeButton richColors />
    </ThemeProvider>
  </StrictMode>
);
