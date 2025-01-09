import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import Home from "./pages/Home.tsx";
import GroupsPage from "./pages/Group.tsx";
import NotFoundPage from "./pages/Notfoundpage.tsx";
import GroupPage from "./pages/Group_page.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupPage  params={{ groupId: "1" }}  />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
