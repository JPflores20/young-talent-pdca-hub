import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2, Maximize2, Minimize2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { StepCard } from "@/components/ui/step-card";

const CustomNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const { setNodes } = useReactFlow();

  const updateData = (field: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n))
    );
  };

  const deleteNode = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  // Define colors (fully opaque)
  const colorMap: Record<string, string> = {
    default: "bg-card border-border",
    white: "bg-white border-gray-300 text-gray-800 dark:bg-white dark:text-gray-800",
    blue: "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200",
    red: "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200",
    green: "bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200",
    yellow: "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-200",
  };
  const bgColorClass = colorMap[data.color || "default"] || colorMap["default"];

  return (
    <div className={cn(
      "relative rounded-md border p-3 shadow-sm min-w-[160px] group transition-colors",
      bgColorClass,
      selected ? "ring-2 ring-primary border-transparent" : ""
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      {/* Edit Controls (visible on hover/select) */}
      <div className={cn(
        "absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border shadow-sm rounded-md p-1 transition-opacity z-10",
        selected ? "opacity-100" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
      )}>
        <button onClick={() => updateData("color", "default")} className="w-4 h-4 rounded-full bg-secondary border hover:scale-110 transition-transform" title="Normal" />
        <button onClick={() => updateData("color", "white")} className="w-4 h-4 rounded-full bg-white border border-gray-300 hover:scale-110 transition-transform" title="Blanco" />
        <button onClick={() => updateData("color", "blue")} className="w-4 h-4 rounded-full bg-blue-500 hover:scale-110 transition-transform" title="Azul" />
        <button onClick={() => updateData("color", "red")} className="w-4 h-4 rounded-full bg-red-500 hover:scale-110 transition-transform" title="Rojo" />
        <button onClick={() => updateData("color", "yellow")} className="w-4 h-4 rounded-full bg-amber-400 hover:scale-110 transition-transform" title="Amarillo" />
        <button onClick={() => updateData("color", "green")} className="w-4 h-4 rounded-full bg-emerald-500 hover:scale-110 transition-transform" title="Verde" />
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive p-0.5">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 nodrag">
        <Input 
          value={data.label} 
          onChange={(e) => updateData("label", e.target.value)}
          className="h-7 text-sm font-semibold text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1"
          placeholder="Nombre del KPI"
        />
        <Input 
          value={data.value} 
          onChange={(e) => updateData("value", e.target.value)}
          className="h-6 text-xs text-center bg-transparent border-transparent hover:border-input focus:border-input shadow-none px-1 font-mono"
          placeholder="Valor (ej. 2.8%)"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const defaultNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: { label: "KPI Principal", value: "0.0%", color: "default" },
    position: { x: 250, y: 5 },
  },
];

const defaultEdges: Edge[] = [];

// Serialize nodes/edges to plain objects safe for Firestore
function serializeNodes(nodes: Node[]): any[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.position.x, y: n.position.y },
    data: { ...n.data },
  }));
}

function serializeEdges(edges: Edge[]): any[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated || false,
    style: e.style || {},
  }));
}

interface KpiTreeProps {
  initialNodes?: any[];
  initialEdges?: any[];
  onChange?: (nodes: any[], edges: any[]) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}

export function KpiTreeInteractive({ initialNodes, initialEdges, onChange, isStepCompleted, onToggleStep }: KpiTreeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const startNodes = (initialNodes && initialNodes.length > 0) ? initialNodes as Node[] : defaultNodes;
  const startEdges = (initialEdges && initialEdges.length > 0) ? initialEdges as Edge[] : defaultEdges;
  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Emit changes to parent with debounce (skip initial mount)
  useEffect(() => {
    if (!onChange) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(serializeNodes(nodes), serializeEdges(edges));
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nodes, edges, onChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Click on an edge to cycle: solid → dashed → animated dashed → solid
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== edge.id) return e;

          const currentStyle = e.style || {};
          const isDashed = currentStyle.strokeDasharray === "6 4";
          const isAnimated = e.animated === true;

          if (!isDashed && !isAnimated) {
            return { ...e, animated: false, style: { ...currentStyle, strokeDasharray: "6 4" } };
          } else if (isDashed && !isAnimated) {
            const { strokeDasharray, ...restStyle } = currentStyle;
            return { ...e, animated: true, style: restStyle };
          } else {
            const { strokeDasharray, ...restStyle } = currentStyle;
            return { ...e, animated: false, style: restStyle };
          }
        })
      );
    },
    [setEdges]
  );

  const addNode = () => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: "custom",
      data: { label: "Nuevo KPI", value: "0.0", color: "default" },
      position: { x: 250, y: 250 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <StepCard 
      className={cn(
        "transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-none bg-background shadow-none p-4"
      )}
      title="PASO 4: KPI TREE (IP)"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addNode(); }}>
            <Plus className="mr-2 size-4" /> Agregar Nodo
          </Button>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-xs text-muted-foreground ml-[36px]">
          Desglosa el KPI en Indicadores de Proceso (IP). Haz doble clic en un nodo o enlace para eliminarlo. Haz clic normal en el enlace para cambiar su estilo.
        </p>
      </div>

      <div className={cn(
        "border border-border rounded-lg bg-secondary/20 overflow-hidden relative transition-all duration-300",
        isFullscreen ? "h-[calc(100vh-80px)]" : "h-[450px]"
      )}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Controls />
          <Background color="var(--color-muted-foreground)" gap={16} />
        </ReactFlow>
      </div>
    </StepCard>
  );
}
