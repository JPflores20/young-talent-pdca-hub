import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { secondaryAuth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertCircle, UserPlus, Shield, User, Trash2 } from "lucide-react";
import type { UserRole, UserProfile } from "@/context/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { currentUser, mockUsers, addMockUser } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [area, setArea] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as Record<string, any>;
        list.push({
          uid: docSnap.id,
          name: (d["name"] as string) || "Usuario",
          email: (d["email"] as string) || "",
          role: (d["role"] as UserRole) || "user",
          area: (d["area"] as string) || "Usuario",
        });
      });
      setUsersList(list);
    }, (err) => {
      console.error("Error en onSnapshot de usuarios:", err);
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    // Actualización optimista en el estado local del componente
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );

    try {
      await setDoc(doc(db, "users", uid), { role: newRole }, { merge: true });
      toast.success("Permiso de usuario actualizado exitosamente.");
    } catch (err: any) {
      console.error("Error al actualizar permiso:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permissions")) {
        toast.warning(
          "Rol actualizado localmente, pero Firebase bloqueó el guardado en la nube por Reglas de Firestore. Revisa tu consola de Firebase.",
          { duration: 6000 }
        );
      } else {
        toast.error("Error al actualizar rol de usuario en la base de datos.");
      }
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    // Si se trata de un mock (aunque en prod se usa la DB real)
    if (mockUsers.find(u => u.uid === uid) && usersList.length === 0) {
      toast.info("No se puede eliminar un usuario simulado de prueba local.");
      return;
    }
    
    try {
      await deleteDoc(doc(db, "users", uid));
      toast.success(`El usuario ${name} ha sido eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      if (err?.code === "permission-denied") {
        toast.error("No tienes permisos suficientes en Firestore para eliminar usuarios.");
      } else {
        toast.error("Error al eliminar el usuario en la base de datos.");
      }
    }
  };

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
    if (!name || !email || !password || !area) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const emailLower = email.trim().toLowerCase();

    try {
      // Crear usuario en Firebase Auth (App Secundaria para no cerrar la sesión activa)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLower, password);
      const uid = cred.user.uid;

      // Enviar correo de verificación
      await sendEmailVerification(cred.user);

      // Guardar perfil en Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email: emailLower,
        role,
        area,
        createdAt: new Date().toISOString(),
      });

      // Actualizar lista local de usuarios
      addMockUser({
        uid,
        name,
        email: emailLower,
        pass: password,
        role,
        area,
      });

      setSuccess(`Usuario ${name} registrado. Se ha enviado un correo de confirmación.`);
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

  const displayUsers = usersList.length > 0 ? usersList : mockUsers;

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Panel de Administración
        </p>
        <h1 className="mt-1 text-3xl font-bold uppercase">Gestión de Usuarios y Permisos</h1>
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

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
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
            <h2 className="font-display text-lg font-bold">Usuarios Registrados ({displayUsers.length})</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/80">
                <TableHead className="font-semibold text-foreground/80">Nombre</TableHead>
                <TableHead className="font-semibold text-foreground/80">Correo</TableHead>
                <TableHead className="font-semibold text-foreground/80">Área</TableHead>
                <TableHead className="w-40 font-semibold text-foreground/80">Modificar Permisos</TableHead>
                <TableHead className="w-20 font-semibold text-foreground/80 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((u) => (
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
                    <Select value={u.role} onValueChange={(v) => handleRoleChange(u.uid, v as UserRole)}>
                      <SelectTrigger className="h-8 w-32 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <span className="flex items-center gap-1">
                            <User className="size-3 text-muted-foreground" /> Usuario
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <Shield className="size-3" /> Admin
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar a <strong className="text-foreground">{u.name}</strong> del sistema? Esta acción no se puede deshacer. Se le revocará el acceso inmediatamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(u.uid, u.name)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
