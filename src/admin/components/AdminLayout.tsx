// ============================================================================
// ADMIN LAYOUT - Shared Layout Component (Sidebar + Topbar + Content)
// ============================================================================

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MessageSquare,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Shield,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useDashboardMetrics, useUnreadMessagesCount } from '../hooks/useAdminData';
import type { DashboardMetrics } from '@/lib/queries';
import { formatRelativeTime } from '@/lib/format/date';

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
}

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
  isLoading,
  onRefresh,
  lastUpdated,
}: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch metrics for badges
  const { data: metrics } = useDashboardMetrics({ autoRefresh: true });
  const unreadCount = useUnreadMessagesCount();

  // Navigation items with badges from metrics
  const navItems: NavItem[] = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    {
      path: '/admin/talent',
      label: 'Talent',
      icon: Users,
      badge: metrics?.talent?.pending || 0,
    },
    {
      path: '/admin/sponsors',
      label: 'Sponsors',
      icon: Building2,
    },
    {
      path: '/admin/blog',
      label: 'Blog',
      icon: FileText,
    },
    { 
      path: '/admin/requests', 
      label: 'Requests', 
      icon: MessageSquare,
      badge: metrics?.requests?.open || 0,
    },
    {
      path: '/admin/messages',
      label: 'Messages',
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Check current route for active state
  const getIsActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/admin/login');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <MobileSidebar
                navItems={navItems}
                getIsActive={getIsActive}
                metrics={metrics}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight">Recommend Her</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  getIsActive(item.path)
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge ? (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={cn(
              'flex items-center transition-all duration-200',
              isSearchOpen ? 'w-64' : 'w-auto'
            )}>
              {isSearchOpen ? (
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    className="pl-9 pr-9 h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="hidden sm:flex"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden sm:flex"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3">
                  <h4 className="font-medium text-sm">Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {unreadCount > 0
                      ? `${unreadCount} unread messages`
                      : 'No new notifications'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/messages')}>
                  <Mail className="w-4 h-4 mr-2" />
                  View Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/talent')}>
                  <Users className="w-4 h-4 mr-2" />
                  Review Talent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-500 text-white text-xs">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">Admin</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Super Admin</p>
                  <p className="text-xs text-muted-foreground">admin@recommendher.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <QuickStat
                label="Talent"
                value={metrics?.talent?.total || 0}
                trend={metrics?.talent?.newThisWeek || 0}
              />
              <QuickStat
                label="Sponsors"
                value={metrics?.sponsors?.total || 0}
                trend={metrics?.sponsors?.newThisMonth || 0}
              />
            </div>

            {/* Secondary Nav */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Quick Links
              </p>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => navigate('/admin/talent?status=pending')}
              >
                <Users className="w-4 h-4 mr-2" />
                Pending Reviews
                {metrics && metrics.talent?.pending > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {metrics.talent.pending}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => navigate('/admin/messages?status=unread')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Unread Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-muted-foreground px-3">
                  Last updated: {formatRelativeTime(lastUpdated.toISOString())}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-64px)]">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            {(title || subtitle || actions) && (
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                  {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE SIDEBAR COMPONENT
// ============================================================================

interface MobileSidebarProps {
  navItems: NavItem[];
  getIsActive: (path: string) => boolean;
  metrics: DashboardMetrics | null;
  onClose: () => void;
}

function MobileSidebar({ navItems, getIsActive, metrics, onClose }: MobileSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold">Recommend Her</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
              getIsActive(item.path)
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {item.badge ? (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Talent</p>
            <p className="text-lg font-bold">{metrics?.talent?.total || 0}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Sponsors</p>
            <p className="text-lg font-bold">{metrics?.sponsors?.total || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK STAT COMPONENT
// ============================================================================

interface QuickStatProps {
  label: string;
  value: number;
  trend?: number;
}

function QuickStat({ label, value, trend }: QuickStatProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-lg font-bold">{value}</p>
        {trend ? (
          <span className="text-xs text-green-600 font-medium">+{trend}</span>
        ) : null}
      </div>
    </div>
  );
}

export default AdminLayout;
