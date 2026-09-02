export function FlavorCorrelationSection({
  isStepCompleted,
  onToggleStep,
}: {
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const positiveData = {
    cleanEndFinish: [
      { x: 30, y: 6.3 }, { x: 8, y: 6.1 }, { x: 10, y: 6.2 }, { x: 70, y: 7.7 }, { x: 85, y: 7.1 }
    ],
    esters: [
      { x: 10, y: 6.2 }, { x: 2, y: 6.1 }, { x: 5, y: 6.1 }, { x: 30, y: 7.2 }, { x: 55, y: 7.7 }
    ]
  };

  const negativeData = {
    lingerBitter: [
      { x: 30, y: 7.8 }, { x: 50, y: 7.1 }, { x: 60, y: 6.4 }, { x: 135, y: 6.1 }
    ],
    smokeyPhenolic: [
      { x: 2, y: 7.7 }, { x: 25, y: 7.2 }, { x: 65, y: 6.2 }, { x: 70, y: 6.2 }
    ],
    astringentDrying: [
      { x: 30, y: 6.2 }, { x: 50, y: 6.2 }, { x: 60, y: 6.3 }, { x: 50, y: 7.2 }
    ]
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-2">
        {onToggleStep && (
          <button
            type="button"
            onClick={onToggleStep}
            className={cn(
              "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
              isStepCompleted
                ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                : "border-muted-foreground/40 text-muted-foreground/40 hover:border-emerald-500 hover:text-emerald-500 bg-background"
            )}
          >
            <Check className="size-4" />
          </button>
        )}
        <h3 className={cn("font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2", isStepCompleted && "text-emerald-600 dark:text-emerald-400")}>
          <span>Correlación de Flavors</span>
          {isStepCompleted && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>
      
      <div className="grid xl:grid-cols-2 gap-6">
        {/* CHART 1: POSITIVE */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-center">Sensory (Global Panel) vs % of tasters who identify the positive attributes</h4>
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
                
                <Scatter name="Clean-End-Finish" data={positiveData.cleanEndFinish} fill="#000" stroke="#f1c40f" strokeWidth={2} />
                <Scatter name="Esters" data={positiveData.esters} fill="#f1c40f" stroke="#000" strokeWidth={1} />
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
          <h4 className="text-sm font-semibold text-center">Sensory (Global Panel) vs % of tasters who identify the Negative Attributes</h4>
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
                
                <Scatter name="Linger-Bitter" data={negativeData.lingerBitter} fill="#4a2e00" stroke="#000" strokeWidth={1} />
                <Scatter name="Smokey-Phenolic" data={negativeData.smokeyPhenolic} fill="#f1c40f" stroke="#000" strokeWidth={1} />
                <Scatter name="Astringent-Drying" data={negativeData.astringentDrying} fill="#654321" stroke="#f1c40f" strokeWidth={1} />
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
    </div>
  );
}
