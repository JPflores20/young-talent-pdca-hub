import React from "react";
import { PdcaComments } from "@/components/pdca-comments";
import { PdcaHistory } from "@/components/pdca-history";
import type { PdcaDialogState } from "../hooks/use_pdca_dialog_state";

interface PdcaBottomSectionProps {
  state: PdcaDialogState;
  autosave: { mark_as_modified: () => void };
  auth_user: { name?: string; email?: string; role?: string } | null;
}

export const PdcaBottomSection: React.FC<PdcaBottomSectionProps> = ({
  state,
  autosave,
  auth_user,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          className={`px-3 py-1 text-xs font-semibold rounded-md ${state.bottom_tab === "comments" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => state.set_bottom_tab("comments")}
        >
          Comentarios
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-xs font-semibold rounded-md ${state.bottom_tab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => state.set_bottom_tab("history")}
        >
          Historial
        </button>
      </div>
      {state.bottom_tab === "comments" ? (
        <PdcaComments
          comments={state.comments_list}
          onAddComment={(text, stepTitle) => {
            const new_comment = {
              id: crypto.randomUUID(),
              userId: auth_user?.email || "anonymous",
              userName: auth_user?.name || "Usuario",
              text,
              timestamp: new Date().toISOString(),
              stepTitle,
            };
            state.set_comments_list([...state.comments_list, new_comment]);
            autosave.mark_as_modified();
          }}
          onDeleteComment={(id) => {
            state.set_comments_list(state.comments_list.filter((c) => c.id !== id));
            autosave.mark_as_modified();
          }}
        />
      ) : (
        <PdcaHistory history={state.history_events} />
      )}
    </div>
  );
};
