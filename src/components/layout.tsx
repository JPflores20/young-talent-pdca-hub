import { ReactNode, useState, useEffect, useMemo } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ClipboardList, 
  LogOut, 
  Menu,
  X,
  Bell,
  Users,
  CheckCircle2,
  ArrowRight,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { subscribeToPdcas } from "@/services/pdca-service";
import { type Pdca } from "@/data/pdca";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pdcaList, setPdcaList] = useState<Pdca[]>([]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      const unsubscribe = subscribeToPdcas((pdcas) => {
        setPdcaList(pdcas);
      });
      return () => {
        unsubscribe();
      };
    }
    return undefined;
  }, [currentUser?.role]);

  const pendingDeadlinePdcas = useMemo(() => {
    if (currentUser?.role !== "admin") return [];
    return pdcaList.filter((p) => !p.fechaFinalizacion || p.fechaFinalizacion.trim() === "");
  }, [pdcaList, currentUser?.role]);
  
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
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-[280px] flex-col bg-gradient-to-b from-[#0a1428] via-[#0f1c38] to-[#080e1e] text-white border-r border-slate-800/80 md:flex shadow-xl z-10 transition-all">
        <div className="flex flex-col items-center justify-center pt-6 pb-3 px-6 text-center shrink-0">
          <div className="size-16 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center border border-white/15 shadow-md mb-2.5 hover:scale-105 transition-transform">
            <img 
              src="/logos/MAZ.jpeg" 
              alt="Logo MAZ" 
              className="h-13 w-13 object-cover rounded-xl"
            />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-wider text-white uppercase leading-none">
            PDCA Hub
          </span>
          <span className="text-[11px] text-blue-300 font-bold tracking-[0.25em] uppercase mt-1">
            Zacatecas
          </span>
        </div>
        
        <div className="px-5 py-2">
          <div className="h-px w-full bg-white/10"></div>
        </div>
        
        <nav className="flex-1 space-y-2 p-4 pt-2">
          <div className="text-xs font-bold text-blue-200/60 mb-3 uppercase tracking-wider px-3">Menú Principal</div>
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
                    : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`size-5 transition-colors ${isActive ? "text-white" : "text-blue-200/70 group-hover:text-white"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 bg-black/20">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-200/80 hover:bg-red-500/20 hover:text-red-300 h-11 text-base font-semibold rounded-xl"
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white px-4 md:px-8 shadow-md relative z-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
              className="text-white hover:bg-white/10 md:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <img 
              src="/logos/MAZ.jpeg" 
              alt="Logo MAZ" 
              className="h-7 w-auto object-contain rounded md:hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="text-blue-200/80 hover:bg-white/10 hover:text-white" />
            
            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-blue-200/80 hover:bg-white/10 hover:text-white">
                  <Bell className="size-5" />
                  {currentUser.role === "admin" && pendingDeadlinePdcas.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-md animate-pulse">
                      {pendingDeadlinePdcas.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 sm:w-96 p-0 border border-slate-700 bg-[#0f1c38] text-white shadow-2xl rounded-xl overflow-hidden">
                <div className="p-4 bg-[#0a1428] border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Notificaciones Admin</h4>
                  </div>
                  {currentUser.role === "admin" && pendingDeadlinePdcas.length > 0 && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">
                      {pendingDeadlinePdcas.length} pendiente{pendingDeadlinePdcas.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                  {currentUser.role === "admin" ? (
                    pendingDeadlinePdcas.length > 0 ? (
                      pendingDeadlinePdcas.map((p) => (
                        <Link
                          key={p.id}
                          to="/"
                          className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-blue-200 truncate group-hover:text-white">{p.titulo || "Sin título"}</span>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0 flex items-center gap-1">
                              <Calendar className="size-3" /> Sin fecha
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300">
                            Creado por: <span className="font-semibold text-white">{p.autor || "Usuario"}</span> ({p.area})
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-blue-400 font-semibold group-hover:text-blue-300">
                            <span>Asignar fecha límite</span>
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-400/80" />
                        <p className="font-semibold text-slate-300">¡Todo al día!</p>
                        <p className="mt-1">Todos los PDCAs registrados cuentan con fecha límite asignada.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      <CheckCircle2 className="size-8 mx-auto mb-2 text-blue-400/80" />
                      <p className="font-semibold text-slate-300">Sin notificaciones</p>
                      <p className="mt-1">No tienes avisos pendientes por el momento.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-3 border-l border-white/15 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white leading-none">{currentUser.name}</p>
                <p className="mt-1 text-xs text-blue-300 font-medium">{currentUser.area}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-md ring-2 ring-blue-500/30">
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
