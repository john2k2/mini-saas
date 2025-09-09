'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import AdvancedLineChart from './advanced-line-chart';
import AdvancedBarChart from './advanced-bar-chart';
import ManualDataInput from './manual-data-input';
import Container from './container';
import Card from './ui/card';
import Button from './ui/button';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionId?: string;
  status?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export default function PremiumContent() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ hasActiveSubscription: false });
  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>([
    { label: 'Enero', value: 120, color: '#3b82f6' },
    { label: 'Febrero', value: 190, color: '#3b82f6' },
    { label: 'Marzo', value: 300, color: '#3b82f6' },
    { label: 'Abril', value: 500, color: '#3b82f6' }
  ]);
  
  const [barChartData, setBarChartData] = useState<ChartDataPoint[]>([
    { label: 'Ventas', value: 400, color: '#10b981' },
    { label: 'Marketing', value: 300, color: '#f59e0b' },
    { label: 'Desarrollo', value: 500, color: '#8b5cf6' }
  ]);

  const handleAddLineData = (data: { metric: string; value: number }) => {
    setLineChartData(prev => {
      const existingIndex = prev.findIndex(item => item.label === data.metric);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          value: data.value 
        };
        return updated;
      } else {
        return [
          ...prev,
          { 
            label: data.metric, 
            value: data.value, 
            color: '#3b82f6' 
          }
        ];
      }
    });
  };

  const handleAddBarData = (data: { metric: string; value: number }) => {
    setBarChartData(prev => {
      const existingIndex = prev.findIndex(item => item.label === data.metric);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { 
          ...updated[existingIndex], 
          value: data.value 
        };
        return updated;
      } else {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
        return [
          ...prev,
          { 
            label: data.metric, 
            value: data.value, 
            color: colors[prev.length % colors.length] 
          }
        ];
      }
    });
  };

  useEffect(() => {
    async function checkSubscription() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        
        console.log('Subscription API response:', data);
        
        setSubscriptionStatus({
          hasActiveSubscription: data.hasActiveSubscription || false,
          subscriptionId: data.subscriptionId,
          status: data.status
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus({ hasActiveSubscription: false });
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [session]);

  if (loading) {
    return (
      <main>
        <Container className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--accent)]"></div>
            <span className="ml-2 text-[color:var(--muted)]">Verificando suscripción...</span>
          </div>
        </Container>
      </main>
    );
  }

  if (!session) {
    return (
      <main>
        <Container className="py-8">
          <Card className="text-center fade-in">
            <div className="p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Iniciar sesión requerido</h3>
              <p className="text-[color:var(--muted)] mb-4">
                Debes iniciar sesión para acceder al contenido premium.
              </p>
              <Button href="/login">
                Iniciar sesión
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <main>
        <Container className="py-8">
          <Card className="text-center fade-in">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suscripción Premium Requerida</h3>
              <p className="text-[color:var(--muted)] mb-6">
                Necesitas una suscripción activa para acceder a este contenido exclusivo.
              </p>
              <Button href="/pricing" className="px-8">
                Obtener Premium
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-8 space-y-6">
        {/* Header de Premium */}
        <div className="fade-in-up text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-sm mb-6 shadow-lg shadow-emerald-500/20">
            <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
            <span className="text-emerald-300 font-medium">Suscripción Premium Activa</span>
            <span className="text-emerald-400">✨</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Dashboard Premium
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Acceso completo a todas las funciones avanzadas de analytics y visualización de datos
          </p>
          {subscriptionStatus.subscriptionId && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/60 border border-white/20">
              <span className="text-white/40">🔑</span>
              ID: {subscriptionStatus.subscriptionId}
            </div>
          )}
        </div>

        {/* Panel de Control de Datos */}
        <Card className="fade-in bg-white/5 backdrop-blur-sm border-white/20">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[color:var(--accent)] to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-[color:var(--accent)]/25">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Panel de Control de Métricas</h2>
                <p className="text-white/70">
                  Ingresa tus propios datos y observa cómo se actualizan los gráficos en tiempo real
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ManualDataInput
                title="Datos de Tendencia"
                description="Para gráfico de líneas"
                onSubmit={handleAddLineData}
                placeholder="Ej: Enero, Q1, Semana 1..."
              />
              <ManualDataInput
                title="Datos Categóricos"
                description="Para gráfico de barras"
                onSubmit={handleAddBarData}
                placeholder="Ej: Ventas, Marketing..."
              />
            </div>
          </div>
        </Card>

        {/* Gráficos Avanzados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="fade-in">
            <AdvancedLineChart 
              data={lineChartData} 
              title="Tendencias Temporales"
              height={350}
            />
          </Card>
          
          <Card className="fade-in">
            <AdvancedBarChart 
              data={barChartData} 
              title="Análisis por Categoría"
              height={350}
            />
          </Card>
        </div>

        {/* Funciones Premium */}
        <Card className="fade-in bg-white/5 backdrop-blur-sm border-white/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Funciones Premium Disponibles</h2>
              <p className="text-white/70">Todas las herramientas que necesitas para análisis profesional</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[color:var(--accent)] to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[color:var(--accent)]/25 group-hover:shadow-[color:var(--accent)]/40 transition-shadow duration-300">
                  <span className="text-white text-2xl">📈</span>
                </div>
                <h3 className="font-bold text-white mb-3">Análisis Avanzado</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Métricas detalladas y reportes personalizados con gráficos interactivos de última generación
                </p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
                  <span className="text-white text-2xl">📁</span>
                </div>
                <h3 className="font-bold text-white mb-3">Exportación de Datos</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Descarga tus datos en formatos CSV, PDF y Excel para análisis externos y presentaciones
                </p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow duration-300">
                  <span className="text-white text-2xl">🎧</span>
                </div>
                <h3 className="font-bold text-white mb-3">Soporte Prioritario</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Ayuda rápida de nuestro equipo de expertos con respuesta garantizada en 24h
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Guía de Uso */}
        <Card className="fade-in bg-white/5 backdrop-blur-sm border-white/20">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-white text-2xl">💡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">¿Cómo usar el Dashboard?</h2>
                <p className="text-white/70">
                  Guía rápida para aprovechar al máximo tus funciones premium
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-[color:var(--accent)]/30">
                <h3 className="font-bold mb-4 text-[color:var(--accent)]/80 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[color:var(--accent)] rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                  Ingreso de Datos
                </h3>
                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="text-[color:var(--accent)]/90 mt-1 text-lg">•</span>
                    <span>Usa el panel superior para agregar métricas personalizadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[color:var(--accent)]/90 mt-1 text-lg">•</span>
                    <span>Los gráficos se actualizan automáticamente al agregar datos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[color:var(--accent)]/90 mt-1 text-lg">•</span>
                    <span>Puedes agregar tanto datos de líneas como de barras</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/30">
                <h3 className="font-bold mb-4 text-emerald-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                  Funciones Avanzadas
                </h3>
                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">•</span>
                    <span>Tooltips interactivos al pasar el cursor sobre los gráficos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">•</span>
                    <span>Gráficos responsivos que se adaptan a tu pantalla</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">•</span>
                    <span>Estadísticas automáticas como totales y promedios</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}
