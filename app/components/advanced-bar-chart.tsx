'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdvancedBarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

export default function AdvancedBarChart({ 
  data, 
  title,
  height = 300 
}: AdvancedBarChartProps) {
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
            <div className="text-4xl mb-2">📊</div>
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
          <p style={{ color: payload[0].color }}>
            Valor: <span className="font-mono font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-white/60 mt-1">
            {Math.round((payload[0].value / validData.reduce((sum, item) => sum + item.value, 0)) * 100)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  const totalValue = validData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...validData.map(d => d.value));

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-white/60 bg-white/10 px-2 py-1 rounded">
          Total: {totalValue}
        </span>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        {validData.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center justify-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || '#6366f1' }}
            />
            <div className="text-left">
              <p className="text-lg font-bold text-white">{item.value}</p>
              <p className="text-xs text-white/60">{Math.round((item.value / totalValue) * 100)}%</p>
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={validData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            stroke="rgba(255,255,255,0.3)"
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Información adicional */}
      <div className="mt-4 flex justify-between text-sm text-white/60">
        <span>Mayor valor: {maxValue} • Promedio: {Math.round(totalValue / validData.length)}</span>
      </div>
    </div>
  );
}
