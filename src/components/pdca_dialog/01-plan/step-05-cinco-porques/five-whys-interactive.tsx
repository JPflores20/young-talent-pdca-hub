import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FiveWhysTable } from "./five-whys-table";
import { FiveWhysEvidences } from "./five-whys-evidences";

export function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: {
  value?: any[] | undefined;
  onChange?: ((whys: any[]) => void) | undefined;
  title?: string | undefined;
  onTitleChange?: ((title: string) => void) | undefined;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadingRows, setUploadingRows] = useState<Set<number>>(new Set());

  const updateRow = (id: number, field: string, val: string) => {
    if (!value || !onChange) return;
    onChange(value.map((r: any) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const addRow = () => {
    if (onChange && value) {
      onChange([
        ...value,
        {
          id: Date.now(),
          q1: "",
          q2: "",
          q3: "",
          q4: "",
          q5: "",
          w1: "",
          w2: "",
          w3: "",
          w4: "",
          w5: "",
          accion: "",
        },
      ]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && value) {
      if (value.length === 1) return;
      onChange(value.filter((r: any) => r.id !== id));
    }
  };

  const whysCount = Math.max(
    5,
    ...(value || []).flatMap((r: any) =>
      Object.keys(r)
        .filter((k) => k.startsWith("q"))
        .map((k) => parseInt(k.substring(1)))
        .filter((n) => !isNaN(n)),
    ),
  );

  const addWhyColumn = () => {
    if (onChange && value) {
      const nextWhy = whysCount + 1;
      onChange(value.map((r: any) => ({ ...r, [`q${nextWhy}`]: "", [`w${nextWhy}`]: "" })));
    }
  };

  const removeWhyColumn = () => {
    if (onChange && value && whysCount > 5) {
      onChange(
        value.map((r: any) => {
          const newRow = { ...r };
          delete newRow[`q${whysCount}`];
          delete newRow[`w${whysCount}`];
          return newRow;
        }),
      );
    }
  };

  const tableContent = (
    <div className="flex flex-col h-full w-full">
      <FiveWhysTable
        value={value}
        title={title}
        index={index}
        whysCount={whysCount}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        onTitleChange={onTitleChange}
        addWhyColumn={addWhyColumn}
        removeWhyColumn={removeWhyColumn}
        addRow={addRow}
        removeRow={removeRow}
        updateRow={updateRow}
        onRemoveTable={onRemoveTable}
      />
      <FiveWhysEvidences
        value={value}
        uploadingRows={uploadingRows}
        setUploadingRows={setUploadingRows}
        updateRow={updateRow}
      />
    </div>
  );

  return (
    <>
      {!isFullscreen && tableContent}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto w-full h-full pb-10">
            {tableContent}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
