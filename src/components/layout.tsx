import { ReactNode, useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ClipboardList, 
  LogOut, 
  Menu,
  X,
  Bell,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(currentPath);

  useEffect(() => {
    if (!loading && !currentUser && !isPublicRoute) {
      navigate({ to: "/login" });
    }
  }, [loading, currentUser, isPublicRoute, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Cargando plataforma...</div>;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/", label: "Mis PDCAs", icon: ClipboardList },
  ];

  if (currentUser.role === "admin") {
    navItems.push({ href: "/admin", label: "Administración", icon: Users });
  }

  const userInitials = currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col bg-brand-dark text-white md:flex shadow-xl z-10">
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logos/MAZ.jpeg" 
              alt="Logo MAZ" 
              className="h-10 w-auto object-contain rounded"
            />
            <span className="font-display text-lg font-bold uppercase tracking-wide text-white">
              PDCA Hub
            </span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`size-5 ${isActive ? "text-white" : "text-white/70"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 size-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-8 shadow-sm relative z-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <img 
              src="/logos/MAZ.jpeg" 
              alt="Logo MAZ" 
              className="h-8 w-auto object-contain rounded md:hidden"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="size-5" />
            </Button>
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{currentUser.area}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex w-64 max-w-xs flex-col bg-brand-dark text-white shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logos/MAZ.jpeg" 
                    alt="Logo MAZ" 
                    className="h-8 w-auto object-contain rounded"
                  />
                  <span className="font-display text-lg font-bold uppercase tracking-wide">PDCA Hub</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1.5 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      currentPath === item.href
                        ? "bg-brand text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="size-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-white/10 p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-3 size-5" />
                  Cerrar Sesión
                </Button>
                <div className="mt-6 text-center text-[10px] text-white/30 leading-tight">
                  <p className="font-semibold uppercase tracking-widest">Cerveceria Zacatecas</p>
                  <p className="mt-1.5">Creado: Ing. en Soft. José Luis Flores</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
