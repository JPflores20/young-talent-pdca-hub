import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { use_pdca_deadline } from "../hooks/use_pdca_deadline";

describe("use_pdca_deadline", () => {
  it("debe retornar false si el usuario es administrador independientemente de la fecha", () => {
    const { result } = renderHook(() => use_pdca_deadline(true, "01/01/2020"));
    expect(result.current).toBe(false);
  });

  it("debe retornar false si la fecha es 'Sin límite' o no está definida", () => {
    const { result: without_limit } = renderHook(() => use_pdca_deadline(false, "Sin límite"));
    expect(without_limit.current).toBe(false);

    const { result: undefined_date } = renderHook(() => use_pdca_deadline(false, undefined));
    expect(undefined_date.current).toBe(false);
  });

  it("debe retornar true si el usuario no es admin y la fecha límite ya expiró", () => {
    const { result } = renderHook(() => use_pdca_deadline(false, "01/01/2020"));
    expect(result.current).toBe(true);
  });

  it("debe retornar false si el usuario no es admin y la fecha límite es en el futuro", () => {
    const next_year = new Date().getFullYear() + 2;
    const { result } = renderHook(() => use_pdca_deadline(false, `31/12/${next_year}`));
    expect(result.current).toBe(false);
  });
});
