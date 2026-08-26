import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Recuperar Contraseña
        </h1>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          Esta función aún no está disponible. Por favor, contacta a tu administrador para restablecer tus credenciales.
        </p>
        <Button onClick={() => navigate({ to: "/login" })} variant="outline" className="w-full">
          <ArrowLeft className="mr-2 size-4" /> Volver al Inicio de Sesión
        </Button>
      </div>
    </div>
  );
}
