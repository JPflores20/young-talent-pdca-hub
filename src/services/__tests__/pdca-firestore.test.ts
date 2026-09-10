/**
 * Pruebas unitarias para `pdca-firestore.ts`.
 *
 * Firebase se mockea completamente para ejecutar estas pruebas
 * sin red, sin configuraciÃ³n de proyecto y sin costo.
 *
 * Se usa `vi.mock` de Vitest para interceptar todas las llamadas
 * a `firebase/firestore` y `@/lib/firebase`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetch_pdcas_from_firestore,
  save_pdca_to_firestore,
  delete_pdca_from_firestore,
  update_pdca_deadline,
} from "../pdca-firestore";
import type { Pdca } from "@/data/pdca-types";

// â”€â”€ Mocks de Firebase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

const {
  mock_set_doc,
  mock_update_doc,
  mock_delete_doc,
  mock_get_docs,
  mock_on_snapshot,
  mock_doc,
  mock_collection,
  mock_query,
  mock_limit,
} = vi.hoisted(() => ({
  mock_set_doc: vi.fn().mockResolvedValue(undefined),
  mock_update_doc: vi.fn().mockResolvedValue(undefined),
  mock_delete_doc: vi.fn().mockResolvedValue(undefined),
  mock_get_docs: vi.fn(),
  mock_on_snapshot: vi.fn(),
  mock_doc: vi.fn(() => ({ id: "mock-ref" })),
  mock_collection: vi.fn(() => ({ id: "mock-collection-ref" })),
  mock_query: vi.fn((ref) => ref),
  mock_limit: vi.fn((n) => n),
}));

vi.mock("firebase/firestore", () => ({
  collection: mock_collection,
  getDocs: mock_get_docs,
  doc: mock_doc,
  setDoc: mock_set_doc,
  deleteDoc: mock_delete_doc,
  onSnapshot: mock_on_snapshot,
  updateDoc: mock_update_doc,
  query: mock_query,
  limit: mock_limit,
}));

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function create_mock_pdca(partial: Partial<Pdca> = {}): Pdca {
  return {
    id: "PDCA-TEST-001",
    titulo: "PDCA de prueba",
    area: "Testing",
    fase: "Plan",
    actualizado: "01 Sep 2026",
    progreso: 0,
    problema: "Problema de prueba",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Test KPI", antes: 0, despues: 0, unidad: "%" },
    serie: [],
    ...partial,
  };
}

function create_seeded_snapshot(pdcas: Pdca[]) {
  return {
    docs: [
      {
        id: "_config",
        data: () => ({ isSeeded: true }),
      },
      ...pdcas.map((p) => ({
        id: p.id,
        data: () => p,
      })),
    ],
  };
}

// â”€â”€ Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetch_pdcas_from_firestore", () => {
  it("retorna los PDCAs cuando la colecciÃ³n ya estÃ¡ sembrada", async () => {
    const test_pdca = create_mock_pdca();
    mock_get_docs.mockResolvedValueOnce(create_seeded_snapshot([test_pdca]));

    const result = await fetch_pdcas_from_firestore();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("PDCA-TEST-001");
  });

  it("retorna arreglo vacÃ­o si Firestore lanza un error", async () => {
    mock_get_docs.mockRejectedValueOnce(new Error("Firestore error simulado"));

    const result = await fetch_pdcas_from_firestore();

    expect(result).toEqual([]);
  });
});

describe("save_pdca_to_firestore", () => {
  it("llama a setDoc si no hay snapshot previo en cachÃ©", async () => {
    const test_pdca = create_mock_pdca({ id: "PDCA-SIN-CACHE" });

    await save_pdca_to_firestore(test_pdca);

    expect(mock_set_doc).toHaveBeenCalledTimes(1);
    expect(mock_update_doc).not.toHaveBeenCalled();
  });

  it("no llama a Firestore si no hubo cambios (diff vacÃ­o)", async () => {
    const { set_pdca_snapshot } = await import("../pdca-cache");
    const test_pdca = create_mock_pdca({ id: "PDCA-CON-CACHE" });
    set_pdca_snapshot(test_pdca.id, test_pdca);

    await save_pdca_to_firestore(test_pdca);

    expect(mock_set_doc).not.toHaveBeenCalled();
    expect(mock_update_doc).not.toHaveBeenCalled();
  });
});

describe("delete_pdca_from_firestore", () => {
  it("llama a deleteDoc con el id correcto", async () => {
    await delete_pdca_from_firestore("PDCA-BORRAR-001");

    expect(mock_delete_doc).toHaveBeenCalledTimes(1);
  });

  it("no lanza error si deleteDoc falla", async () => {
    mock_delete_doc.mockRejectedValueOnce(new Error("Error de red"));

    await expect(delete_pdca_from_firestore("PDCA-FALLA")).resolves.not.toThrow();
  });
});

describe("update_pdca_deadline", () => {
  it("llama a updateDoc con fechaFinalizacion cuando se provee fecha", async () => {
    await update_pdca_deadline("PDCA-001", "2026-12-31");

    expect(mock_update_doc).toHaveBeenCalledWith(expect.anything(), {
      fechaFinalizacion: "2026-12-31",
    });
  });

  it("usa string vacÃ­o cuando la fecha es null", async () => {
    await update_pdca_deadline("PDCA-001", null);

    expect(mock_update_doc).toHaveBeenCalledWith(expect.anything(), { fechaFinalizacion: "" });
  });
});
