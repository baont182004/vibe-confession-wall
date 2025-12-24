import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';
import { useStreak } from '../hooks/useStreak';
import {
  LayoutGrid,
  CalendarDays,
  BookOpenText,
  User,
  Shield,
  LogOut,
  Flame,
  Menu,
  MoreHorizontal,
} from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState({});
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const { streak } = useStreak();
  const isWideViewport = useMediaQuery('(min-width: 1280px)');

  useEffect(() => {
    document.title = 'DearPeer';
  }, []);

  if (loading) {
    return (
      <div className="app-shell" style={{ padding: 24, textAlign: 'center', color: 'var(--textMuted)' }}>
        Đang tải...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isActive = (path) => location.pathname === path;
  const displayName = user.nickname || 'Ẩn danh';
  const hasDetailedDock = isWideViewport && location.pathname === '/weekly-plan';

  const navItems = useMemo(() => {
    const items = [
      { to: '/', label: 'Bảng tin', Icon: LayoutGrid },
      { to: '/weekly-plan', label: 'Kế hoạch tuần', Icon: CalendarDays },
      { to: '/journal', label: 'Nhật ký', Icon: BookOpenText },
      { to: '/profile', label: 'Hồ sơ', Icon: User },
    ];
    if (user.role === 'admin') {
      items.push({ to: '/admin', label: 'Quản trị', Icon: Shield });
    }
    return items;
  }, [user.role]);

  const compactNav = navItems.slice(0, 4);
  const overflowNav = navItems.slice(4);
  const currentStreak = streak?.currentStreak || 0;
  const streakClass = clsx(
    'streak-chip',
    currentStreak === 0 && 'is-muted',
    currentStreak >= 15 && 'is-hot',
    currentStreak >= 5 && currentStreak < 15 && 'shadow-[0_0_0_2px_rgba(255,180,84,0.35)]'
  );

  useEffect(() => {
    setPopoverOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!popoverOpen) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const popoverWidth = 220;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const computedStyle = getComputedStyle(document.documentElement);
      const statsWidth = parseFloat(computedStyle.getPropertyValue('--stats-w')) || 360;
      const statsGap = parseFloat(computedStyle.getPropertyValue('--stats-gap')) || 16;
      const statsClearance = hasDetailedDock ? statsWidth + statsGap : 0;
      const topbarHeight = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--topbar-h') || '72'
      );
      const baseTop = Math.max(topbarHeight + 8, rect.bottom + 8);
      const popoverHeight = popoverRef.current?.offsetHeight || 140;
      let top = baseTop;
      if (top + popoverHeight > viewportHeight - 16) {
        const flipped = rect.top - popoverHeight - 8;
        top = Math.max(flipped, topbarHeight + 8);
      }
      let left = rect.left;
      const maxLeft = viewportWidth - popoverWidth - 16 - statsClearance;
      left = Math.min(left, maxLeft);
      left = Math.max(16, left);
      setPopoverStyle({ top, left, minWidth: popoverWidth, position: 'fixed' });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const handleClickOutside = (event) => {
      if (buttonRef.current?.contains(event.target)) return;
      if (popoverRef.current?.contains(event.target)) return;
      setPopoverOpen(false);
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [popoverOpen, hasDetailedDock]);

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              DearPeer
            </Link>
          </div>

          <div className="navbar-center">
            <div className="hidden xl:flex nav-links">
              {navItems.map(({ to, label, Icon }) => (
                <Link key={to} to={to} className={clsx('nav-link', isActive(to) && 'is-active')}>
                  <Icon size={18} /> {label}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex xl:hidden nav-links">
              {compactNav.map(({ to, label, Icon }) => (
                <Link key={to} to={to} className={clsx('nav-link', isActive(to) && 'is-active')}>
                  <Icon size={18} /> {label}
                </Link>
              ))}
              {overflowNav.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="nav-more">
                      <MoreHorizontal size={16} /> Thêm
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="center" className="w-48 p-2">
                    <div className="flex flex-col gap-1">
                      {overflowNav.map(({ to, label, Icon }) => (
                        <Link key={to} to={to} className={clsx('nav-link', isActive(to) && 'is-active')}>
                          <Icon size={16} /> {label}
                        </Link>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex lg:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" aria-label="Mở menu">
                    <Menu size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-56 p-2">
                  <div className="flex flex-col gap-1">
                    {navItems.map(({ to, label, Icon }) => (
                      <Link key={to} to={to} className={clsx('nav-link', isActive(to) && 'is-active')}>
                        <Icon size={16} /> {label}
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="nav-user">
            <button
              type="button"
              ref={buttonRef}
              className={streakClass}
              aria-haspopup="true"
              aria-expanded={popoverOpen}
              onClick={() => setPopoverOpen((prev) => !prev)}
            >
              <Flame
                size={16}
                className={currentStreak === 0 ? 'text-[var(--textMuted)]' : 'text-[var(--accent-3)]'}
              />
              <span>{currentStreak}</span>
            </button>
            <Avatar user={user} size={32} />
            <span className="nav-greeting">Xin chào, {displayName}</span>
            <Button variant="ghost" size="sm" onClick={logout} aria-label="Đăng xuất">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>
      {popoverOpen &&
        createPortal(
          <div ref={popoverRef} className="streak-popover" style={popoverStyle}>
            <div className="text-sm font-semibold text-[var(--text)]">Chuỗi hiện tại</div>
            <div className="text-sm text-[var(--textMuted)]">{currentStreak} ngày</div>
            <div className="mt-2 text-sm font-semibold text-[var(--text)]">Kỷ lục</div>
            <div className="text-sm text-[var(--textMuted)]">{streak?.bestStreak || 0} ngày</div>
          </div>,
          document.body
        )}

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
