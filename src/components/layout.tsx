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
import { usePdcas } from "@/context/pdca-context";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { updatePdcaDeadline } from "@/services/pdca-service";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { allPdcas } = usePdcas();
  const [deadlinePickerOpenId, setDeadlinePickerOpenId] = useState<string | null>(null);

  const handleDeadlineChange = async (pdcaId: string, date: Date | undefined) => {
    const formatted = date && isValid(date) ? format(date, "dd/MM/yyyy", { locale: es }) : "";
    await updatePdcaDeadline(pdcaId, formatted || null);
    setDeadlinePickerOpenId(null);
  };

  const pendingDeadlinePdcas = useMemo(() => {
    if (currentUser?.role !== "admin") return [];
    return allPdcas.filter((p) => !p.fechaFinalizacion || p.fechaFinalizacion.trim() === "");
  }, [allPdcas, currentUser?.role]);
  
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
        
        <nav className="flex-1 space-y-1 p-4 pt-2">
          <div className="text-xs font-bold text-blue-200/60 mb-3 uppercase tracking-wider px-3">Menú Principal</div>
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
                    : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`size-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-blue-200/70 group-hover:text-white"}`} />
                <span className="truncate">{item.label}</span>
                {isActive && <div className="ml-auto size-1.5 rounded-full bg-white/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/10 p-4 space-y-3 bg-black/20">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5 border border-white/8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm shadow-md ring-2 ring-blue-500/30">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white leading-none">{currentUser.name}</p>
              <p className="truncate text-xs text-blue-300/80 mt-0.5">{currentUser.area}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
              currentUser.role === "admin" 
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}>
              {currentUser.role === "admin" ? "Admin" : "User"}
            </span>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-200/70 hover:bg-red-500/15 hover:text-red-300 h-9 text-sm font-medium rounded-xl gap-3"
            onClick={handleLogout}
          >
            <LogOut className="size-4 shrink-0" />
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
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-md">
                      {pendingDeadlinePdcas.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 sm:w-[380px] p-0 border border-border bg-background text-foreground shadow-2xl rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <Bell className="size-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground leading-none">Notificaciones</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Panel de administración</p>
                    </div>
                  </div>
                  {currentUser.role === "admin" && pendingDeadlinePdcas.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold border border-red-200 dark:border-red-800">
                      {pendingDeadlinePdcas.length} sin fecha
                    </span>
                  )}
                </div>

                <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
                  {currentUser.role === "admin" ? (
                    pendingDeadlinePdcas.length > 0 ? (
                      pendingDeadlinePdcas.map((p) => (
                        <Popover
                          key={p.id}
                          open={deadlinePickerOpenId === p.id}
                          onOpenChange={(open) => setDeadlinePickerOpenId(open ? p.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <div
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 border border-transparent hover:border-border transition-all group cursor-pointer"
                            >
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
                                <Calendar className="size-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate leading-snug">{p.titulo || "Sin título"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {p.autor || "Usuario"} · <span className="text-foreground/60">{p.area}</span>
                                </p>
                                <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                  <span>Asignar fecha límite</span>
                                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                </div>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end" side="left">
                            <CalendarUI
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => handleDeadlineChange(p.id, date)}
                              locale={es}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="font-semibold text-sm text-foreground">¡Todo al día!</p>
                        <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">Todos los PDCAs tienen fecha límite asignada.</p>
                      </div>
                    )
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">Sin notificaciones</p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">No tienes avisos pendientes por el momento.</p>
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
