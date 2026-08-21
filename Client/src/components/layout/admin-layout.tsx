import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Calendar,
  Ticket,
  HeartPulse,
  Users,
  ScrollText,
  ArchiveRestore,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";

const adminNav = (t: (k: string) => string) => [
  { to: "/admin", label: t("admin.sidebar.dashboard"), icon: LayoutDashboard },
  { to: "/admin/movies", label: t("admin.sidebar.movies"), icon: Film },
  { to: "/admin/movies/deleted", label: t("admin.sidebar.deletedMovies"), icon: ArchiveRestore },
  { to: "/admin/showtimes", label: t("admin.sidebar.showtimes"), icon: Calendar },
  { to: "/admin/bookings", label: t("admin.sidebar.bookings"), icon: Ticket },
  { to: "/admin/users", label: t("admin.sidebar.users"), icon: Users },
  { to: "/admin/logs", label: t("admin.sidebar.logs"), icon: ScrollText },
  { to: "/admin/health", label: t("admin.sidebar.health"), icon: HeartPulse },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
        <img src="/filmak-logo.png" alt="Filmak" className="size-8 rounded-md object-cover" />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Filmak</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Panel</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNav(t).map((item) => {
          const Icon = item.icon;
  ***REMOVED*** (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
            {(user?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="size-4" />
          {t("admin.sidebar.signOut")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar hidden w-64 shrink-0 bg-sidebar md:block">
        <div className="sticky top-0 h-svh">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden bg-background/80 backdrop-blur"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="admin-sidebar w-64 p-0 bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground pl-12 md:pl-0">
            <ChevronLeft className="size-4" />
            {t("admin.sidebar.backToSite")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
