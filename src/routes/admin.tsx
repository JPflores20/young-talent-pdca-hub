import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { secondaryAuth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, UserPlus, Shield, User } from "lucide-react";
import type { UserRole } from "@/context/auth-context";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { currentUser, mockUsers, addMockUser } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [area, setArea] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="size-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acceso Denegado</h2>
        <p className="text-muted-foreground mt-2">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("El correo es estrictamente obligatorio.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const emailLower = email.trim().toLowerCase();

    try {
      // Intentar crear en Firebase (Auth Secundario)
      let uid = "";
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLower, password);
        uid = cred.user.uid;
        
        // Guardar en Firestore
        await setDoc(doc(db, "users", uid), {
          name,
          email: emailLower,
          role,
          area
        });
      } catch (fbError: any) {
        console.warn("Firebase falló, registrando en Fallback Local.", fbError.message);
        // Fallback: crear UID simulado
        uid = `mock-${Date.now()}`;
      }

      // Actualizar estado local (sincronización inmediata)
      addMockUser({
        uid,
        name,
        email: emailLower,
        pass: password, // For mock login
        role,
        area
      });

      setSuccess(`Usuario ${name} registrado exitosamente.`);
      setName("");
      setEmail("");
      setPassword("");
      setArea("");
      
    } catch (err: any) {
      setError(err.message || "Error al registrar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Panel de Administración
        </p>
        <h1 className="mt-1 text-3xl font-bold uppercase">Gestión de Usuarios</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario de registro */}
        <div className="lg:col-span-1 space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] h-fit">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <h2 className="font-display text-xl font-bold">Registrar Usuario</h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Roberto Torres" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico (Obligatorio)</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@gmodelo.com.mx" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña temporal</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área / Departamento</Label>
              <Input id="area" required value={area} onChange={e => setArea(e.target.value)} placeholder="Ej. Logística" />
            </div>

            <div className="space-y-2">
              <Label>Rol del Sistema</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario Regular</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-brand-dark mt-2" disabled={loading}>
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-bold">Usuarios del Sistema</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/80">
                <TableHead className="font-semibold text-foreground/80">Nombre</TableHead>
                <TableHead className="font-semibold text-foreground/80">Correo</TableHead>
                <TableHead className="font-semibold text-foreground/80">Área</TableHead>
                <TableHead className="w-32 font-semibold text-foreground/80">Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((u) => (
                <TableRow key={u.uid} className="transition-colors hover:bg-secondary/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.area}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === 'admin' ? 'bg-brand-yellow/20 text-brand-yellow-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {u.role === 'admin' ? <Shield className="size-3" /> : <User className="size-3" />}
                      {u.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
