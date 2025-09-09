'use client';

import { useState } from 'react';

interface ManualDataInputProps {
  title: string;
  description: string;
  onSubmit: (data: { metric: string; value: number }) => void;
  placeholder?: string;
}

export default function ManualDataInput({ 
  title, 
  description, 
  onSubmit, 
  placeholder = "Ej: Ventas, Marketing..." 
}: ManualDataInputProps) {
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metric.trim() || !value.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      alert('El valor debe ser un número válido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit({ metric: metric.trim(), value: numericValue });
      setMetric('');
      setValue('');
    } catch (error) {
      console.error('Error al agregar datos:', error);
      alert('Error al agregar los datos. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:shadow-lg hover:shadow-[color:var(--accent)]/20 transition-all duration-300 group">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[color:var(--accent)] to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <span className="text-white text-lg">📊</span>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
          <p className="text-white/70 text-sm">{description}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="metric" className="block text-sm font-medium text-white/80 mb-2">
            Nombre de la métrica
          </label>
          <input
            type="text"
            id="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)] placeholder-white/50 text-white transition-all duration-200 hover:border-white/50"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-white/80 mb-2">
            Valor
          </label>
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ingresa un número..."
            step="0.01"
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)] placeholder-white/50 text-white transition-all duration-200 hover:border-white/50"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !metric.trim() || !value.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              Agregar Datos
            </div>
          )}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-[color:var(--accent)]/20 backdrop-blur-sm border border-[color:var(--accent)]/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-[color:var(--accent)]/80">
          <span className="text-blue-400">💡</span>
          <span className="font-medium">Tip:</span>
          Los gráficos se actualizarán automáticamente en tiempo real
        </div>
      </div>
    </div>
  );
}
