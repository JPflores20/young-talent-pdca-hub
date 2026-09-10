import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MetaFieldsProps {
  title_value: string;
  on_title_change: (value: string) => void;
  area_value: string;
  on_area_change: (value: string) => void;
  deadline_date?: Date | undefined;
  on_deadline_change: (date?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, name: string) => void;
  assigned_users: { name: string; email: string }[];
  on_toggle_assigned_user: (user: { name: string; email: string }) => void;
  available_users: { name: string; email: string }[];
  is_admin_user: boolean;
  is_editable: boolean;
}

export const PdcaMetaFields: React.FC<MetaFieldsProps> = ({
  title_value, on_title_change,
  area_value, on_area_change,
  deadline_date, on_deadline_change,
  author_email, on_author_change,
  assigned_users, on_toggle_assigned_user,
  available_users, is_admin_user, is_editable,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border/80 bg-card/60">
      <div className="space-y-1.5 sm:col-span-2">
        <Label className="text-xs font-semibold">Título del Proyecto</Label>
        <Input
          value={title_value}
          onChange={(e) => on_title_change(e.target.value)}
          disabled={!is_editable}
          placeholder="Ej: Reducción de mermas en cocimientos"
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Área Operativa</Label>
        <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cocimientos">Cocimientos</SelectItem>
            <SelectItem value="fermentacion">Fermentación</SelectItem>
            <SelectItem value="filtracion">Filtración</SelectItem>
            <SelectItem value="envasado">Envasado</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="logistica">Logística</SelectItem>
            <SelectItem value="calidad">Calidad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Fecha Límite</Label>
        <DatePicker
          date={deadline_date}
          setDate={on_deadline_change}
          placeholder="DD/MM/AAAA"
          disabled={!is_admin_user}
          className="h-9 text-xs w-full"
        />
      </div>

      {is_admin_user && (
        <>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Autor Principal</Label>
            <Select
              value={author_email}
              onValueChange={(selected_email) => {
                const found_user = available_users.find((u) => u.email === selected_email);
                on_author_change(selected_email, found_user?.name || "Usuario");
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Seleccionar autor" />
              </SelectTrigger>
              <SelectContent>
                {available_users.map((user_item) => (
                  <SelectItem key={user_item.email} value={user_item.email}>
                    {user_item.name} ({user_item.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Co-responsables Asignados</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2">
                  {assigned_users.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Asignar colaboradores...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {assigned_users.map((assigned_item) => (
                        <Badge key={assigned_item.email} variant="secondary" className="text-[11px] py-0">
                          {assigned_item.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {available_users.map((user_item) => {
                    const is_currently_assigned = assigned_users.some((a) => a.email === user_item.email);
                    return (
                      <div
                        key={user_item.email}
                        onClick={() => on_toggle_assigned_user(user_item)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                      >
                        <span>{user_item.name}</span>
                        {is_currently_assigned && <Badge variant="outline" className="text-[10px]">Asignado</Badge>}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
};
