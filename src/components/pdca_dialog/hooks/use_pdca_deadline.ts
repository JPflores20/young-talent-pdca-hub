import { useMemo } from "react";
import { parse_date_string } from "../utils/date_helpers";

/**
 * Hook personalizado para determinar si un PDCA está bloqueado para edición.
 * Los administradores siempre tienen permiso de edición.
 * Los usuarios regulares quedan bloqueados si la fecha de finalización ya expiró.
 */
export const use_pdca_deadline = (
  is_administrator: boolean,
  deadline_date_string?: string | null,
): boolean => {
  return useMemo(() => {
    if (is_administrator) {
      return false;
    }

    if (!deadline_date_string || typeof deadline_date_string !== "string") {
      return false;
    }

    const trimmed_deadline = deadline_date_string.trim();
    if (trimmed_deadline === "Sin límite" || trimmed_deadline === "") {
      return false;
    }

    const deadline_date = parse_date_string(trimmed_deadline);
    if (!deadline_date) {
      return false;
    }

    const current_day = new Date();
    current_day.setHours(0, 0, 0, 0);

    const target_day = new Date(deadline_date.getTime());
    target_day.setHours(0, 0, 0, 0);

    return target_day < current_day;
  }, [is_administrator, deadline_date_string]);
};
