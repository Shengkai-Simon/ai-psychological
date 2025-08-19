import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChildLoginPage from "./pages/ChildLoginPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import ChildSurveyPage from "./pages/ChildSurveyPage";
import ParentSurveyPage from "./pages/ParentSurveyPage";
import CompletionPage from "./pages/CompletionPage";
import ReportPage from "./pages/ReportPage";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider.tsx";

function ThemeSyncByRoute() {
  const location = useLocation();
  const { setTheme } = useTheme();

  useEffect(() => {
    const path = location.pathname;
    if (
      path.startsWith("/survey/child") ||
      path.startsWith("/report/child") ||
      path.startsWith("/complete/child")
    ) {
      setTheme("child");
    } else if (
      path.startsWith("/survey/parent") ||
      path.startsWith("/report/parent") ||
      path.startsWith("/complete/parent")
    ) {
      setTheme("parent");
    } else {
      setTheme("global");
    }
  }, [location.pathname, setTheme]);

  return null;
}

function App() {
  return (
    <Router>
      <ThemeSyncByRoute />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<Navigate to="/report/parent" replace />} />
        <Route path="/report/:view" element={<ReportPage />} />
        <Route path="/survey/child/login" element={<ChildLoginPage />} />
        <Route path="/survey/parent/login" element={<ParentLoginPage />} />
        <Route path="/survey/child" element={<ChildSurveyPage />} />
        <Route path="/survey/parent" element={<ParentSurveyPage />} />
        <Route path="/complete" element={<Navigate to="/complete/parent" replace />} />
        <Route path="/complete/:view" element={<CompletionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
