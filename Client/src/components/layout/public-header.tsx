import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, Ticket, LogOut, Menu, Trash2, AlertTriangle, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";
import { deleteAccount } from "@/api/auth.api";
import { LanguageToggle } from "@/components/language-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function PublicHeader() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success(t("auth.deleteDialog.success"));
      logout();
      navigate("/");
    } catch {
      toast.error(t("auth.deleteDialog.failed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/movies?search=${encodeURIComponent(search)}`);
    }
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/movies", label: t("nav.movies") },
    { to: "/showtimes", label: t("nav.showtimes") },
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <motion.img
            src="/filmak-logo.png"
            alt="Filmak"
            className="size-8 rounded-md object-cover"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-lg font-bold tracking-tight">Filmak</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                location.pathname === link.to
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xs md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {user && <NotificationBell />}
          <LanguageToggle />
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{(user.name ?? "").split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 size-4" />
                  {t("nav.favorites")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                  <Ticket className="mr-2 size-4" />
                  {t("nav.myBookings")}
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <User className="mr-2 size-4" />
                    {t("nav.admin")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 size-4" />
                      {t("nav.deleteAccount")}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" />
                        {t("auth.deleteDialog.title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("auth.deleteDialog.desc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {deleting
                          ? t("auth.deleteDialog.deleting")
                          : t("auth.deleteDialog.confirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                {t("common.signIn")}
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                {t("common.signUp")}
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-6">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/filmak-logo.png" alt="Filmak" className="size-8 rounded-md object-cover" />
                  <span className="text-lg font-bold tracking-tight">Filmak</span>
                </Link>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("movies.searchPlaceholder")}
                      className="pl-9"
                    />
                  </div>
                </form>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.to}>
                      <Link
                        to={link.to}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                          location.pathname === link.to
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {user && (
                    <>
                      <SheetClose asChild>
                        <Link
                          to="/favorites"
                          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                        >
                          {t("nav.favorites")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/my-bookings"
                          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                        >
                          {t("nav.myBookings")}
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
                {!user && (
                  <div className="flex flex-col gap-2 pt-4">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={() => navigate("/login")}>
                        {t("common.signIn")}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button onClick={() => navigate("/register")}>
                        {t("common.signUp")}
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
