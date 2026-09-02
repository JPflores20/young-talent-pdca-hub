import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { primaryAuth, db } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Iniciar Sesión · PDCA Hub" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, addMockUser } = useAuth();
  
  // State for toggling panels
  const [isRegistering, setIsRegistering] = useState(false);

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- REGISTER STATE ---
  const [nombre, setNombre] = useState("");
  const [paterno, setPaterno] = useState("");
  const [materno, setMaterno] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // --- PASSWORD VISIBILITY STATE ---
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor, completa todos los campos.");
      setLoginLoading(false);
      return;
    }
    
    try {
      await login(loginEmail, loginPassword);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setLoginError(err.message || "Error al iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!nombre || !paterno || !materno || !regEmail || !regPassword || !confirmPassword) {
      setRegError("Por favor, completa todos los campos.");
      return;
    }

    if (regPassword !== confirmPassword) {
      setRegError("Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(regPassword)) {
      setRegError("La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un carácter especial.");
      return;
    }

    setRegLoading(true);

    try {
      const fullName = [nombre, paterno, materno].filter(Boolean).join(" ");
      const emailLower = regEmail.trim().toLowerCase();

      primaryAuth.languageCode = "es";
      const cred = await createUserWithEmailAndPassword(primaryAuth, emailLower, regPassword);
      const user = cred.user;

      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email: emailLower,
        role: "user",
        area: "Usuario",
        createdAt: new Date().toISOString()
      });

      await sendEmailVerification(user);
      await signOut(primaryAuth);
      
      setRegSuccess(true);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setRegError("Este correo corporativo ya está registrado. Por favor, intenta iniciar sesión.");
      } else if (err.code === "auth/invalid-email") {
        setRegError("El correo electrónico no es válido.");
      } else if (err.code === "auth/weak-password") {
        setRegError("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        console.error("Error en registro:", err);
        setRegError(`Error al registrar: ${err.message}`);
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleUppercase = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.toUpperCase());
  };

  if (regSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-green-500/20 bg-green-50/50 p-8 text-center shadow-lg dark:bg-green-950/20">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold text-green-700 dark:text-green-300">
            ¡Registro Exitoso!
          </h1>
          <p className="mb-6 text-sm text-green-600/80 dark:text-green-400/80">
            Hemos enviado un correo de verificación oficial a <strong>{regEmail}</strong>. 
            Por razones de seguridad, debes activar tu cuenta desde tu bandeja de entrada antes de poder iniciar sesión en el sistema.
          </p>
          <Button onClick={() => { setRegSuccess(false); setIsRegistering(false); }} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Volver al Inicio de Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      
      {/* WHITE PANEL (Forms Container) */}
      <div className="absolute inset-0 flex w-full">
        
        {/* LOGIN FORM (Left half) */}
        <div className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out ${isRegistering ? '-translate-x-[100%] opacity-0 pointer-events-none absolute' : 'translate-x-0 opacity-100 relative z-10'}`}>
          <div className="mx-auto w-full max-w-sm px-8 py-12">
            <div className="mb-10 flex flex-col items-center justify-center text-center">
              <img 
                src="/logos/MAZ.jpeg" 
                alt="Logo MAZ" 
                className="mb-6 h-36 w-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-105"
              />
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                PDCA Hub
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Módulo PDCA de Mejora Continua
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {loginError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <p>{loginError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="loginEmail">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    type="email"
                    required
                    className="pl-9"
                    placeholder="ana.lopez@gmodelo.com.mx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loginPassword">Contraseña</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    type={showLoginPassword ? "text" : "password"}
                    required
                    className="pl-9 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] hover:opacity-90 text-white shadow-md" disabled={loginLoading}>
                {loginLoading ? "Iniciando sesión..." : "Ingresar a mi cuenta"}
                {!loginLoading && <ArrowRight className="ml-2 size-4" />}
              </Button>
              
              <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
                <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
                <div className="flex items-center gap-1 lg:hidden">
                  <span>¿No tienes una cuenta?</span>
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-primary hover:underline font-medium">
                    Regístrate aquí
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-10 text-center text-xs text-muted-foreground">
              <p>© 2026 Grupo Modelo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>

        {/* REGISTER FORM (Right half) */}
        <div className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out absolute top-0 bottom-0 right-0 ${isRegistering ? 'opacity-100 z-10 scale-100 pointer-events-auto' : 'opacity-0 z-0 scale-95 pointer-events-none'}`}>
          <div className="mx-auto w-full max-w-md px-8 py-12 overflow-y-auto max-h-screen">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <img src="/logos/MAZ.jpeg" alt="Logo" className="h-full w-full object-cover rounded-xl opacity-90" />
              </div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                Registro de Colaborador
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresa tus datos oficiales para solicitar acceso a PDCA Hub.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              {regError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <p>{regError}</p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Datos Personales</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="nombre" className="text-xs">Nombre(s) *</Label>
                    <Input id="nombre" required value={nombre} onChange={handleUppercase(setNombre)} placeholder="Ej. ANA MARIA" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="paterno" className="text-xs">Apellido Paterno *</Label>
                    <Input id="paterno" required value={paterno} onChange={handleUppercase(setPaterno)} placeholder="LOPEZ" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="materno" className="text-xs">Apellido Materno</Label>
                    <Input id="materno" value={materno} onChange={handleUppercase(setMaterno)} placeholder="HERNANDEZ" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Credenciales</h3>
                <div className="space-y-1">
                  <Label htmlFor="regEmail" className="text-xs">Correo Electrónico Corporativo *</Label>
                  <Input id="regEmail" type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="correo@gmodelo.com.mx" />
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="regPassword" className="text-xs">Contraseña *</Label>
                    <div className="relative">
                      <Input 
                        id="regPassword" 
                        type={showRegPassword ? "text" : "password"}
                        required 
                        value={regPassword} 
                        onChange={(e) => setRegPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className={`pr-10 ${
                          regPassword && confirmPassword
                            ? regPassword === confirmPassword 
                              ? "border-green-500 focus-visible:ring-green-500" 
                              : "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-xs">Confirmar *</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className={`pr-10 ${
                          regPassword && confirmPassword
                            ? regPassword === confirmPassword 
                              ? "border-green-500 focus-visible:ring-green-500" 
                              : "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Mínimo 6 caracteres, al menos una mayúscula, un número y un símbolo (!@#$%).
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] hover:opacity-90 text-white shadow-md" disabled={regLoading}>
                  {regLoading ? "Procesando Registro..." : "Crear Mi Cuenta"}
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground lg:hidden">
                <button type="button" onClick={() => setIsRegistering(false)} className="text-primary hover:underline font-medium">
                  Ya tengo cuenta, iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* BLUE SLIDING OVERLAY (Desktop only) */}
      <div className={`hidden lg:flex absolute top-0 left-0 h-full w-1/2 bg-gradient-to-b from-[#0a1428] via-[#0f1c38] to-[#080e1e] text-white z-20 transition-transform duration-700 ease-in-out shadow-2xl items-center justify-center overflow-hidden ${isRegistering ? 'translate-x-0' : 'translate-x-full'}`}>
         
         {/* Background accent decorations */}
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

         {/* CONTENT: LOGIN MODE (Shows when panel is on the right) */}
         <div className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${isRegistering ? 'opacity-0 translate-x-16 pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}>
            <div className="flex flex-col flex-1 justify-center items-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">Programa de Excelencia</p>
              <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
                TRANSFORMANDO EL<br />FUTURO CON<br />MEJORA CONTINUA.
              </h2>
              <p className="text-base text-white/80 max-w-md leading-relaxed">
                Aplica la metodología Plan-Do-Check-Act para estandarizar procesos, reducir mermas y potenciar tu desarrollo dentro de Grupo Modelo.
              </p>
              
              <div className="mt-12 space-y-4">
                <p className="text-sm font-medium text-white/70">¿Eres nuevo en la plataforma?</p>
                <Button 
                  variant="outline" 
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8" 
                  onClick={() => setIsRegistering(true)}
                >
                  Regístrate aquí
                </Button>
              </div>
            </div>

            <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
               <span>AB InBev</span>
               <span>•</span>
               <span>Grupo Modelo</span>
            </div>
         </div>

         {/* CONTENT: REGISTER MODE (Shows when panel is on the left) */}
         <div className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${isRegistering ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 -translate-x-16 pointer-events-none'}`}>
            <div className="flex flex-col flex-1 justify-center items-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">Cultura MAZ</p>
              <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
                ÚNETE AL EQUIPO<br />QUE LIDERA EL<br />CAMBIO.
              </h2>
              <p className="text-base text-white/80 max-w-md leading-relaxed">
                Regístrate para obtener acceso al Módulo PDCA. Al crear tu cuenta, tu identidad corporativa será resguardada bajo los más altos estándares de seguridad.
              </p>
              
              <div className="mt-12 space-y-4">
                <p className="text-sm font-medium text-white/70">¿Ya tienes una cuenta?</p>
                <Button 
                  variant="outline" 
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8" 
                  onClick={() => setIsRegistering(false)}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>

            <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
               <span>Cervecería Zacatecas</span>
               <span>•</span>
               <span>Mejora Continua</span>
            </div>
         </div>

      </div>

    </div>
  );
}
