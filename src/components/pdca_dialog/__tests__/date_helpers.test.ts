import { describe, it, expect } from "vitest";
import { parse_date_string, format_date_to_string } from "../utils/date_helpers";

describe("date_helpers", () => {
  describe("parse_date_string", () => {
    it("debe retornar undefined si recibe una entrada nula o vacía", () => {
      expect(parse_date_string(null)).toBeUndefined();
      expect(parse_date_string(undefined)).toBeUndefined();
      expect(parse_date_string("")).toBeUndefined();
      expect(parse_date_string("   ")).toBeUndefined();
    });

    it("debe parsear correctamente formato DD/MM/YYYY", () => {
      const parsed_date = parse_date_string("25/12/2026");
      expect(parsed_date).toBeDefined();
      expect(parsed_date?.getFullYear()).toBe(2026);
      expect(parsed_date?.getMonth()).toBe(11); // Mes base cero
      expect(parsed_date?.getDate()).toBe(25);
    });

    it("debe parsear correctamente formato YYYY-MM-DD", () => {
      const parsed_date = parse_date_string("2026-05-18");
      expect(parsed_date).toBeDefined();
      expect(parsed_date?.getFullYear()).toBe(2026);
      expect(parsed_date?.getMonth()).toBe(4);
      expect(parsed_date?.getDate()).toBe(18);
    });

    it("debe retornar undefined para cadenas no válidas", () => {
      expect(parse_date_string("fecha_invalida")).toBeUndefined();
      expect(parse_date_string("99/99/999999")).toBeUndefined();
    });
  });

  describe("format_date_to_string", () => {
    it("debe retornar cadena vacía si no recibe una fecha válida", () => {
      expect(format_date_to_string(null)).toBe("");
      expect(format_date_to_string(undefined)).toBe("");
      expect(format_date_to_string(new Date("invalida"))).toBe("");
    });

    it("debe formatear una fecha válida al formato DD/MM/YYYY con ceros a la izquierda", () => {
      const test_date = new Date(2026, 4, 3); // 3 de mayo de 2026
      expect(format_date_to_string(test_date)).toBe("03/05/2026");
    });
  });
});
