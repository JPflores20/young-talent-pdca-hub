/**
 * Utilidades de manipulación y formateo de fechas para el módulo PDCA.
 * Implementa snake_case estricto y funciones puras con manejo seguro de nulos.
 */

export const parse_date_string = (raw_date_string?: string | null): Date | undefined => {
  if (!raw_date_string || typeof raw_date_string !== "string") {
    return undefined;
  }

  const trimmed_date = raw_date_string.trim();

  // Formato YYYY-MM-DD
  if (trimmed_date.includes("-")) {
    const date_parts = trimmed_date.split("-").map(Number);
    const [year, month, day] = date_parts;
    if (year !== undefined && month !== undefined && day !== undefined && year > 1000) {
      const parsed_date = new Date(year, month - 1, day);
      return isNaN(parsed_date.getTime()) ? undefined : parsed_date;
    }
  }

  // Formato DD/MM/YYYY
  if (trimmed_date.includes("/")) {
    const date_parts = trimmed_date.split("/").map(Number);
    const [day, month, year] = date_parts;
    if (day !== undefined && month !== undefined && year !== undefined) {
      const parsed_date = new Date(year, month - 1, day);
      return isNaN(parsed_date.getTime()) ? undefined : parsed_date;
    }
  }

  const fallback_parsed_date = new Date(trimmed_date);
  return isNaN(fallback_parsed_date.getTime()) ? undefined : fallback_parsed_date;
};

export const format_date_to_string = (date_object?: Date | null): string => {
  if (!date_object || !(date_object instanceof Date) || isNaN(date_object.getTime())) {
    return "";
  }

  const formatted_day = String(date_object.getDate()).padStart(2, "0");
  const formatted_month = String(date_object.getMonth() + 1).padStart(2, "0");
  const formatted_year = date_object.getFullYear();

  return `${formatted_day}/${formatted_month}/${formatted_year}`;
};
