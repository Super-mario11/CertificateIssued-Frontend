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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold tracking-wide">
            <img
              src="/logo.svg"
              alt="Excellence Computer Center logo"
              className="h-10 w-10 rounded-lg border border-goldSoft/60 bg-white p-1"
              loading="lazy"
            />
            <span>Excellence Computer Center</span>
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10" role="main">
        <AppRouter />
      </main>
      <footer className="border-t border-goldSoft/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate md:flex-row md:items-center md:justify-between">
          <p>© 2026 Excellence Computer Center.</p>
          <p>Secure certificate verification portal.</p>
        </div>
      </footer>
    </div>
  );
}
