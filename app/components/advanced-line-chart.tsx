'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdvancedLineChartProps {
  data: { label: string; value: number; date?: string }[];
  title: string;
  color?: string;
  height?: number;
}

export default function AdvancedLineChart({ 
  data, 
  title, 
  color = "#3b82f6",
  height = 300 
}: AdvancedLineChartProps) {
  // Validar y transformar datos
  const validData = data.filter(item => 
    item && 
    typeof item.value === 'number' && 
    !isNaN(item.value) && 
    item.label
  );

  if (validData.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        <div className="flex items-center justify-center h-64 text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No hay datos disponibles</p>
            <p className="text-sm text-white/40 mt-1">Agrega algunos datos para ver el gráfico</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm p-3 border border-white/20 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{label}</p>
          <p style={{ color }}>
            Valor: <span className="font-mono font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const range = maxValue - minValue;
  const yAxisDomain = [
    Math.max(0, minValue - range * 0.1),
    maxValue + range * 0.1
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-white/60">
            {validData.length} puntos de datos
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {validData[validData.length - 1]?.value || 0}
            </p>
            <p className="text-sm text-white/60">Último valor</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {Math.max(...validData.map(d => d.value))}
            </p>
            <p className="text-sm text-white/60">Máximo</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[color:var(--accent)]">
              {Math.round(validData.reduce((acc, d) => acc + d.value, 0) / validData.length)}
            </p>
            <p className="text-sm text-white/60">Promedio</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={validData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            domain={yAxisDomain}
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
