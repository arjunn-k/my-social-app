import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AppShell() {
  const { currentUser, unreadNotifications, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-sand/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <NavLink to="/" className="font-display text-3xl text-ink">
              Pulse
            </NavLink>
            <p className="text-xs uppercase tracking-[0.3em] text-slate">
              Signal-rich social
            </p>
          </div>

          <nav className="flex items-center gap-3">
            <NavLink
              to="/"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
            >
              Feed
            </NavLink>
            {currentUser && (
              <NavLink
                to={`/profile/${currentUser.username}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
              >
                Profile
              </NavLink>
            )}
            <div className="hidden rounded-full bg-white px-4 py-2 text-sm text-slate sm:block">
              {unreadNotifications} notifications
            </div>
            <button type="button" onClick={logout} className="btn-secondary py-2">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;

