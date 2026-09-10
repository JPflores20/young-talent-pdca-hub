/**
 * Pruebas unitarias para `use-pdca-draft.ts` y `get_empty_draft`.
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { get_empty_draft, use_pdca_draft } from "../use-pdca-draft";
import { DEFAULT_VPO_CHECKPOINTS } from "@/data/pdca-defaults";

describe("get_empty_draft", () => {
  it("crea un PDCA con la fase 'Plan' y arrays/objetos base iniciados", () => {
    const user = { name: "Test User", email: "test@gmodelo.com" };
    const draft = get_empty_draft(user);

    expect(draft.fase).toBe("Plan");
    expect(draft.autor).toBe("Test User");
    expect(draft.autor_email).toBe("test@gmodelo.com");
    expect(draft.acciones).toEqual([]);
    expect(draft.vpo_checkpoints.length).toBe(DEFAULT_VPO_CHECKPOINTS.length);
  });

  it("asigna un autor genérico si no se provee usuario", () => {
    const draft = get_empty_draft();
    expect(draft.autor).toBe("Sin autor");
    expect(draft.autor_email).toBe("");
  });
});

describe("use_pdca_draft", () => {
  it("inicializa con draft vacío si initial_pdca es null", () => {
    const { result } = renderHook(() => use_pdca_draft(null));
    expect(result.current.draft.id).toMatch(/^PDCA-\d{4}-\d{3}$/);
    expect(result.current.draft.titulo).toBe("");
  });

  it("inicializa con initial_pdca si se provee", () => {
    const initial: any = { id: "PDCA-123", titulo: "Test Title" };
    const { result } = renderHook(() => use_pdca_draft(initial));

    expect(result.current.draft.id).toBe("PDCA-123");
    expect(result.current.draft.titulo).toBe("Test Title");
  });

  it("actualiza el draft correctamente usando update_draft", () => {
    const { result } = renderHook(() => use_pdca_draft(null));

    act(() => {
      result.current.update_draft({ titulo: "Nuevo Título", area: "Envasado" });
    });

    expect(result.current.draft.titulo).toBe("Nuevo Título");
    expect(result.current.draft.area).toBe("Envasado");
    // El resto debe mantenerse intacto
    expect(result.current.draft.fase).toBe("Plan");
  });

  it("reacciona a cambios de initial_pdca (sincronización externa)", () => {
    const initial1: any = { id: "P1", titulo: "T1" };
    const initial2: any = { id: "P2", titulo: "T2" };

    const { result, rerender } = renderHook(({ pdca }) => use_pdca_draft(pdca), {
      initialProps: { pdca: initial1 },
    });

    expect(result.current.draft.titulo).toBe("T1");

    rerender({ pdca: initial2 });

    expect(result.current.draft.titulo).toBe("T2");
  });
});
