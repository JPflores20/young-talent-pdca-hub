import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, FileStack, Lock } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mis PDCAs", url: "/", icon: ClipboardList },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-yellow font-display text-lg font-bold text-brand-yellow-foreground">
            GM
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-display text-base font-semibold uppercase tracking-wide">
              Grupo Modelo
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Plataforma Jóvenes Talentos
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled
                  tooltip="Mis RDAs — Próximamente"
                  className="opacity-50"
                >
                  <FileStack />
                  <span>Mis RDAs</span>
                  <Lock className="ml-auto size-3.5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent px-2 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            AL
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">Becaria: Ana López</p>
            <p className="truncate text-xs text-sidebar-foreground/70">Ingeniería de Software</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
