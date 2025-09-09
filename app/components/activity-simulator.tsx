'use client';

import { useState } from 'react';
import Button from './ui/button';
import Card from './ui/card';

interface ActivitySimulatorProps {
  onActivityCreated?: () => void;
}

export default function ActivitySimulator({ onActivityCreated }: ActivitySimulatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const activities = [
    { name: 'Exportar datos', action: 'data_export' },
    { name: 'Generar reporte', action: 'report_generation' },
    { name: 'Llamada API', action: 'api_call' },
    { name: 'Descarga de template', action: 'template_download' },
    { name: 'Ver webinar', action: 'webinar_view' },
    { name: 'Actualizar perfil', action: 'profile_update' }
  ];

  const simulateActivity = async (action: string, name: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/analytics/simulate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, metadata: { source: 'simulator', name } }),
      });

      if (response.ok) {
        setMessage(`✅ Actividad "${name}" registrada con éxito`);
        onActivityCreated?.();
      } else {
        setMessage('❌ Error al registrar la actividad');
      }
    } catch (error) {
      console.error('Error simulating activity:', error);
      setMessage('❌ Error de conexión');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Card className="fade-in">
      <h2 className="text-xl font-semibold mb-3">🎮 Simulador de Actividad</h2>
      <p className="text-[color:var(--muted)] mb-4">
        Simula diferentes acciones para generar datos en los analytics
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {activities.map((activity) => (
          <Button
            key={activity.action}
            variant="outline"
            onClick={() => simulateActivity(activity.action, activity.name)}
            disabled={isLoading}
            className="text-sm py-2 px-3"
          >
            {activity.name}
          </Button>
        ))}
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message}
        </div>
      )}

      {isLoading && (
        <div className="text-sm text-[color:var(--muted)] text-center py-2">
          Procesando actividad...
        </div>
      )}
    </Card>
  );
}
