import { useRef, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { savePdcaToFirestore } from "@/services/pdca-service";
import { format_date_to_string } from "../utils/date_helpers";
import type { Pdca, Phase } from "@/data/pdca";

export const use_pdca_autosave = (
  pdca_identifier: string,
  current_payload_getter: () => Pdca,
  is_editable: boolean,
  current_user_name?: string,
  on_save_success?: () => Promise<void>
) => {
  const [is_saving, set_is_saving] = useState(false);
  const [has_unsaved_changes, set_has_unsaved_changes] = useState(false);
  const last_saved_json_ref = useRef<string>("");
  const is_first_mount_ref = useRef<boolean>(true);

  // Inicialización de la referencia guardada
  useEffect(() => {
    is_first_mount_ref.current = true;
    const initial_payload = current_payload_getter();
    last_saved_json_ref.current = JSON.stringify(initial_payload);
    set_has_unsaved_changes(false);
  }, [pdca_identifier]);

  // Manejo de guardado explícito en base de datos
  const handle_save_to_firestore = useCallback(
    async (next_phase_target?: Phase): Promise<boolean> => {
      if (!is_editable || is_saving) {
        return false;
      }

      set_is_saving(true);
      const payload_to_save = current_payload_getter();

      if (next_phase_target) {
        payload_to_save.fase = next_phase_target;
      }

      try {
        await savePdcaToFirestore(payload_to_save);
        last_saved_json_ref.current = JSON.stringify(payload_to_save);
        set_has_unsaved_changes(false);
        try {
          // If refresh function is provided via closure or hook, it should be called here
          if (on_save_success) {
            await on_save_success();
          }
        } catch(e) {}
        toast.success("¡PDCA sincronizado con éxito en la base de datos!");
        return true;
      } catch (save_error) {
        console.error("Error al persistir PDCA en Firestore:", save_error);
        toast.error("Error al intentar guardar en la base de datos.");
        return false;
      } finally {
        set_is_saving(false);
      }
    },
    [is_editable, is_saving, current_payload_getter]
  );

  // Autosave y detección de modificaciones
  const mark_as_modified = useCallback(() => {
    set_has_unsaved_changes(true);
  }, []);

  return {
    is_saving,
    has_unsaved_changes,
    set_has_unsaved_changes,
    mark_as_modified,
    handle_save_to_firestore,
  };
};
