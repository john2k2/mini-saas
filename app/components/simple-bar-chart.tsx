interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export default function SimpleBarChart({ 
  data, 
  height = 200, 
  className = "" 
}: SimpleBarChartProps) {
  // Validar que tenemos datos válidos
  if (!data || data.length === 0) {
    return (
      <div className={`w-full ${className} flex items-center justify-center`} style={{ height: `${height}px` }}>
        <p className="text-[color:var(--muted)] text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  // Filtrar datos válidos y asegurar valores numéricos
  const validData = data.filter(d => d && typeof d.value === 'number' && !isNaN(d.value));
  
  if (validData.length === 0) {
    return (
      <div className={`w-full ${className} flex items-center justify-center`} style={{ height: `${height}px` }}>
        <p className="text-[color:var(--muted)] text-sm">No hay datos válidos</p>
      </div>
    );
  }

  const maxValue = Math.max(...validData.map(d => d.value)) || 1;
  
  return (
    <div className={`w-full ${className}`}>
      <div 
        className="flex items-end justify-between gap-2 px-2"
        style={{ height: `${height}px` }}
      >
        {validData.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          const color = item.color || "var(--accent)";
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-12 sm:max-w-16">
              {/* Valor */}
              <div className="text-xs font-medium mb-1 text-center leading-tight">
                {item.value}
              </div>
              
              {/* Barra */}
              <div 
                className="w-full rounded-t-md transition-all duration-700 ease-out"
                style={{ 
                  height: `${barHeight}px`,
                  background: `linear-gradient(to top, ${color}, ${color}80)`,
                  minHeight: "4px"
                }}
              />
              
              {/* Label */}
              <div className="text-xs text-[color:var(--muted)] mt-2 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
