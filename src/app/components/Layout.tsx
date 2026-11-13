import { useCallback, useEffect, useState } from "react";
import { Sidebar, navigationItems, type PageId } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { Analytics } from "./Analytics";
import { Configuration } from "./Configuration";
import { Reports } from "./Reports";
import { Settings } from "./Settings";
import { useLocalSetting } from "./useLocalSetting";

// The original Dashboard and Analytics are not restyled or recreated here.
const pageFromHash = (): PageId => {
  const candidate = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return navigationItems.find(item => item.id === candidate)?.id ?? "dashboard";
};

export function Layout() {
  const [currentPage, setCurrentPage] = useState<PageId>(pageFromHash);
  // Keep the Figma dashboard's ORIGINAL light design as the default.
  const [isDark, setIsDark] = useLocalSetting<boolean>("ems-original-dashboard-dark-v2", false);
  const [userName, setUserName] = useLocalSetting<string>("ems-demo-name-v1", "Liam Gallagher");

  const navigate = useCallback((page: PageId) => {
    setCurrentPage(page);
    const hash = `#/${page}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);

  useEffect(() => {
    const onHashChange = () => setCurrentPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className="ems-preserved-app">
      <Sidebar currentPage={currentPage} onPageChange={navigate}
        isDark={isDark} onThemeToggle={() => setIsDark(value => !value)} userName={userName} />
      <main id="main-content" className="ems-preserved-content" key={currentPage}>
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "analytics" && <Analytics />}
        {currentPage === "configuration" && <Configuration />}
        {currentPage === "reports" && <Reports />}
        {currentPage === "settings" && <Settings userName={userName} onSaveUserName={setUserName}
          isDark={isDark} onThemeToggle={() => setIsDark(value => !value)} />}
      </main>
    </div>
  );
}
