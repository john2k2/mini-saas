interface SimpleLineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
}

export default function SimpleLineChart({ 
  data, 
  height = 200, 
  className = "",
  color = "var(--accent)"
}: SimpleLineChartProps) {
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

  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const chartHeight = height - 60; // Espacio para labels
  const chartWidth = 100; // Porcentaje
  
  // Generar puntos del SVG con validación
  const points = validData.map((item, index) => {
    const x = validData.length > 1 ? (index / (validData.length - 1)) * chartWidth : chartWidth / 2;
    const y = ((maxValue - item.value) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  // Generar área bajo la curva
  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;
  
  // ID único para el gradiente
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="relative" style={{ height: `${height}px` }}>
        {/* SVG Chart */}
        <svg 
          className="absolute inset-0 w-full"
          style={{ height: `${chartHeight}px` }}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Área bajo la curva */}
          <polygon
            points={areaPoints}
            fill={`url(#${gradientId})`}
            className="opacity-20"
          />
          
          {/* Línea principal */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Gradiente */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Puntos */}
          {validData.map((item, index) => {
            const x = validData.length > 1 ? (index / (validData.length - 1)) * chartWidth : chartWidth / 2;
            const y = ((maxValue - item.value) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Labels en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {validData.map((item, index) => (
            <div key={index} className="text-xs text-[color:var(--muted)] text-center">
              {item.label}
            </div>
          ))}
        </div>
        
        {/* Valores en hover (opcional) */}
        <div className="absolute top-2 left-2 text-xs text-[color:var(--muted)]">
          Max: {maxValue} | Min: {minValue}
        </div>
      </div>
    </div>
  );
}
