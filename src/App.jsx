import { Link, useLocation, useNavigate } from "react-router-dom";
import AppRouter from "./router.jsx";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="page text-ink flex min-h-screen flex-col">
      <header className="border-b border-goldSoft/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-wide sm:gap-3 sm:text-xl"
          >
            <img
              src="/logo.svg"
              alt="Excellence Computer Center logo"
              className="h-9 w-9 rounded-lg border border-goldSoft/60 bg-white p-1 sm:h-10 sm:w-10"
              loading="lazy"
            />
            <span className="truncate">Excellence Computer Center</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link to="/certificates" className="hover:text-goldDark">
              Public
            </Link>
            <Link to="/admin/dashboard" className="hover:text-goldDark">
              Admin
            </Link>
            {isAdminRoute && token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
              >
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10" role="main">
        <AppRouter />
      </main>
      <footer className="border-t border-goldSoft/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-slate sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Excellence Computer Center.</p>
          <p>Secure certificate verification portal.</p>
        </div>
      </footer>
    </div>
  );
}
