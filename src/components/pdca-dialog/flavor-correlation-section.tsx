import { useEffect, useState, useMemo, useCallback, useRef, Fragment } from "react";
import {
  Check,
  UploadCloud,
  Paperclip,
  Plus,
  Save,
  ArrowRight,
  ArrowDown,
  MinusCircle,
  X,
  RefreshCw,
  FileText,
  Maximize2,
  CheckCircle2
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PdcaComments } from "../pdca-comments";
import { PdcaHistory } from "../pdca-history";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PhaseBadge } from "@/components/pdca-badge";
import { phases, DEFAULT_TARGET_VS_ACTUAL, DEFAULT_PARETO_DATA_MAP, DEFAULT_VPO_CHECKPOINTS, DEFAULT_PARTICIPANTES, type ParticipantesData, type ActionItem, type Pdca, type Phase, type ParetoItem, type VpoCheckpointItem, type DefinicionMeta, type ImpactMatrixRow, type FiveWhysTableData, type IshikawaItem } from "@/data/pdca";
import { PdcaGoalDefinition, PdcaParticipants, DEFAULT_DEFINICION_META } from "@/components/pdca-goal-definition";
import { KpiTreeInteractive } from "../kpi-tree";
import { ActionKanban } from "../action-kanban";
// Removed firestore imports
import { db } from "@/lib/firebase";
import { GopThemesSection } from "../GopThemesSection";
import { ImageUploadSection, MultiImageUploadSection } from "../image-upload-section";
import { DatePicker } from "@/components/ui/date-picker";
import { savePdcaToFirestore } from "@/services/pdca-service";
import { useAuth } from "@/context/auth-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepCard } from "@/components/ui/step-card";


export function FlavorCorrelationSection({
  isStepCompleted,
  onToggleStep,
}: {
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const [data, setData] = useState({
    cleanEndFinish: [
      { id: 1, x: 30, y: 6.3 }, { id: 2, x: 8, y: 6.1 }, { id: 3, x: 10, y: 6.2 }, { id: 4, x: 70, y: 7.7 }, { id: 5, x: 85, y: 7.1 }
    ],
    esters: [
      { id: 6, x: 10, y: 6.2 }, { id: 7, x: 2, y: 6.1 }, { id: 8, x: 5, y: 6.1 }, { id: 9, x: 30, y: 7.2 }, { id: 10, x: 55, y: 7.7 }
    ],
    lingerBitter: [
      { id: 11, x: 30, y: 7.8 }, { id: 12, x: 50, y: 7.1 }, { id: 13, x: 60, y: 6.4 }, { id: 14, x: 135, y: 6.1 }
    ],
    smokeyPhenolic: [
      { id: 15, x: 2, y: 7.7 }, { id: 16, x: 25, y: 7.2 }, { id: 17, x: 65, y: 6.2 }, { id: 18, x: 70, y: 6.2 }
    ],
    astringentDrying: [
      { id: 19, x: 30, y: 6.2 }, { id: 20, x: 50, y: 6.2 }, { id: 21, x: 60, y: 6.3 }, { id: 22, x: 50, y: 7.2 }
    ]
  });

  const [positiveTitle, setPositiveTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the positive attributes");
  const [negativeTitle, setNegativeTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the Negative Attributes");


  const updatePoint = (series: keyof typeof data, id: number, field: "x" | "y", value: number) => {
    setData(prev => ({
      ...prev,
      [series]: prev[series].map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const addPoint = (series: keyof typeof data) => {
    setData(prev => ({
      ...prev,
      [series]: [...prev[series], { id: Date.now(), x: 0, y: 6.0 }]
    }));
  };

  const removePoint = (series: keyof typeof data, id: number) => {
    setData(prev => ({
      ...prev,
      [series]: prev[series].filter(p => p.id !== id)
    }));
  };

  const SeriesEditor = ({ name, series, label }: { name: keyof typeof data, series: any[], label: string }) => (
    <div className="border rounded p-3 space-y-2">
      <div className="font-bold text-sm flex justify-between items-center">
        {label}
        <Button variant="outline" size="sm" onClick={() => addPoint(name)} className="h-6 text-xs px-2"><Plus className="size-3 mr-1"/> Añadir</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {series.map(p => (
          <div key={p.id} className="flex items-center gap-1 bg-secondary/30 p-1 rounded">
            <span className="text-[10px] font-bold w-3">X:</span>
            <Input type="number" value={p.x} onChange={e => updatePoint(name, p.id, "x", Number(e.target.value))} className="h-6 text-xs px-1" />
            <span className="text-[10px] font-bold w-3 ml-1">Y:</span>
            <Input type="number" step="0.1" value={p.y} onChange={e => updatePoint(name, p.id, "y", Number(e.target.value))} className="h-6 text-xs px-1" />
            <Button variant="ghost" size="icon" onClick={() => removePoint(name, p.id)} className="h-6 w-6 text-destructive shrink-0"><X className="size-3"/></Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <StepCard 
      title="Correlación de Flavors"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="size-4 mr-2" /> Editar Puntos
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <h3 className="text-lg font-bold">Editar Puntos de Correlación</h3>
              <div className="grid grid-cols-2 gap-4">
                <SeriesEditor name="cleanEndFinish" series={data.cleanEndFinish} label="Clean-End-Finish" />
                <SeriesEditor name="esters" series={data.esters} label="Esters" />
                <SeriesEditor name="lingerBitter" series={data.lingerBitter} label="Linger-Bitter" />
                <SeriesEditor name="smokeyPhenolic" series={data.smokeyPhenolic} label="Smokey-Phenolic" />
                <SeriesEditor name="astringentDrying" series={data.astringentDrying} label="Astringent-Drying" />
              </div>
            </DialogContent>
          </Dialog>
      }
    >

      <div className="grid xl:grid-cols-2 gap-6">
        {/* CHART 1: POSITIVE */}
        <div className="space-y-2">
          <input 
            value={positiveTitle} 
            onChange={(e) => setPositiveTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrants - approximate colors based on image */}
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                
                <Scatter name="Clean-End-Finish" data={data.cleanEndFinish} fill="#000" stroke="#f1c40f" strokeWidth={2} />
                <Scatter name="Esters" data={data.esters} fill="#f1c40f" stroke="#000" strokeWidth={1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-2 items-end">
            <span className="font-bold text-sm mb-1">Pearson Correlation</span>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-black border border-yellow-400"></div> Clean-End-Finish</span>
              <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1">0.760</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div> Esters</span>
              <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1">0.998</span>
            </div>
          </div>
        </div>

        {/* CHART 2: NEGATIVE */}
        <div className="space-y-2">
          <input 
            value={negativeTitle} 
            onChange={(e) => setNegativeTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrants */}
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                
                <Scatter name="Linger-Bitter" data={data.lingerBitter} fill="#4a2e00" stroke="#000" strokeWidth={1} />
                <Scatter name="Smokey-Phenolic" data={data.smokeyPhenolic} fill="#f1c40f" stroke="#000" strokeWidth={1} />
                <Scatter name="Astringent-Drying" data={data.astringentDrying} fill="#654321" stroke="#f1c40f" strokeWidth={1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-2 items-end">
            <span className="font-bold text-sm mb-1">Pearson Correlation</span>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-[#4a2e00] border border-black"></div> Linger-Bitter</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.900</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div> Smokey-Phenolic</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.994</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-[#654321] border border-yellow-400"></div> Astringent-Drying</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.355</span>
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
}

