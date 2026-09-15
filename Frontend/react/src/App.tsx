import { useState } from "react";
import { Routes, Route, NavLink, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import AuthCard from "./components/AuthCard";
import { useAuth } from "./hooks/useAuth";

function GitHubMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-500/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.87 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    </span>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition rounded-lg px-3 py-2 ${
    isActive
      ? "bg-white/15 text-white"
      : "text-brand-100 hover:bg-white/10 hover:text-white"
  }`;

export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    nav("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 shadow-lg shadow-brand-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-display font-bold text-lg text-white"
              onClick={() => setMenuOpen(false)}
            >
              <GitHubMark />
              <span className="hidden sm:inline">GitHub Repo Explorer</span>
              <span className="sm:hidden">Repo Explorer</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              {user && (
                <NavLink to="/favorites" className={navLinkClass}>
                  ⭐ Favorites
                </NavLink>
              )}
              {!user && (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Log in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="ml-1 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
                  >
                    Sign up
                  </NavLink>
                </>
              )}
              {user && (
                <div className="ml-2 flex items-center gap-3 border-l border-white/20 pl-3">
                  <span className="text-sm text-brand-100 max-w-[10rem] truncate">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-brand-100 transition hover:bg-white/10 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile nav panel */}
          {menuOpen && (
            <nav className="sm:hidden flex flex-col gap-1 pb-4 animate-fade-in">
              {user ? (
                <>
                  <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-200">
                    {user.name || user.email}
                  </span>
                  <NavLink to="/favorites" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                    ⭐ Favorites
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="text-left rounded-lg px-3 py-2 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                    Log in
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                    Sign up
                  </NavLink>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route
            path="/login"
            element={
              <AuthCard>
                <Login />
              </AuthCard>
            }
          />
          <Route
            path="/register"
            element={
              <AuthCard>
                <Register />
              </AuthCard>
            }
          />
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center py-24 text-center">
                <p className="text-6xl mb-3">🧭</p>
                <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
                <p className="mt-1 text-slate-500">
                  That page doesn't exist. Head back to the search page.
                </p>
                <Link
                  to="/"
                  className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Go home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <p>
            Built by{" "}
            <a
              href="https://maddiepst.github.io/"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-brand-600 hover:underline"
            >
              Madalina Pastiu
            </a>
          </p>
          <a
            href="https://github.com/MaddiePst"
            target="_blank"
            rel="noreferrer noopener"
            className="text-slate-500 hover:text-brand-600"
          >
            @MaddiePst on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
