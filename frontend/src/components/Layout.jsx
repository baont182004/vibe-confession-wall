import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Home, MessageCircle, User, Shield, LogOut, CalendarClock } from 'lucide-react';

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-shell" style={{ padding: 24, textAlign: 'center', color: 'var(--textMuted)' }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isActive = (path) => location.pathname === path;
  const displayName = user.nickname || 'Anonymous';

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              CampusPeer
            </Link>

            <div className="nav-links">
              <Link to="/" className={clsx('nav-link', isActive('/') && 'is-active')}>
                <Home size={18} /> Feed
              </Link>
              <Link to="/chat" className={clsx('nav-link', isActive('/chat') && 'is-active')}>
                <MessageCircle size={18} /> Chat
              </Link>
              <Link to="/weekly-plan" className={clsx('nav-link', isActive('/weekly-plan') && 'is-active')}>
                <CalendarClock size={18} /> Weekly Plan
              </Link>
              <Link to="/profile" className={clsx('nav-link', isActive('/profile') && 'is-active')}>
                <User size={18} /> Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={clsx('nav-link', isActive('/admin') && 'is-active')}>
                  <Shield size={18} /> Admin
                </Link>
              )}
            </div>
          </div>

          <div className="nav-user">
            <Avatar user={user} size={32} />
            <span className="nav-greeting">Hi, {displayName}</span>
            <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
