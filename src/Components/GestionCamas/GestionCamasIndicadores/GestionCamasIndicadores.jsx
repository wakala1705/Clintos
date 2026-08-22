'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasIndicadores.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import InfoTooltip from './InfoTooltip/InfoTooltip';
import ExportarMenu from './ExportarMenu/ExportarMenu';
import TendenciaChart from './TendenciaChart/TendenciaChart';
import BarrasComparativas from './BarrasComparativas/BarrasComparativas';
import IndicadoresTable from './IndicadoresTable/IndicadoresTable';
import IndicadoresSkeleton from './IndicadoresSkeleton/IndicadoresSkeleton';
import IndicadoresEmptyState from './IndicadoresEmptyState/IndicadoresEmptyState';
import {
  INDICADORES_POR_SERVICIO, INDICADORES_POR_SEDE, KPI_PRINCIPALES, MOTIVOS_FUERA_SERVICIO,
  PERIODOS, SEDES, SEDE_LABEL, SERVICIOS, SERVICIO_LABEL, TABS, TAB_BY_ID, TIEMPOS_ADICIONALES,
  ULTIMA_ACTUALIZACION, formatFechaHora, generarSerie,
} from '@/hooks/GestionCamas/mockIndicadoresData';
import {
  LuActivity, LuArrowDown, LuArrowUp, LuBan, LuBedDouble, LuCalendarClock, LuCircleAlert, LuCircleCheck, LuSearchX, LuTimer,
} from 'react-icons/lu';

const ICONO_POR_KPI = {
  ocupacion: LuBedDouble, disponibilidad: LuCircleCheck, rotacion: LuActivity, limpieza: LuTimer, fueraServicio: LuBan,
};

const GRANULARIDADES = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
];

// Promedio global por tab (encargo, sección 6-15) — números de contexto
// fijos, mismo criterio que KPI_PRINCIPALES (mockIndicadoresData.js): la
// evolución temporal de cada tab converge en ESTE valor cuando no hay un
// filtro de Sede/Servicio activo. "Utilización" reusa Ocupación y "Tiempos"
// reusa el tiempo de limpieza como referencia (ver TABS en el mock, mismo
// motivo documentado ahí).
const VALOR_GLOBAL_POR_TAB = {
  ocupacion: 82.2, disponibilidad: 17.8, utilizacion: 82.2, rotacion: 1.8, tiempos: 32, 'fuera-servicio': 6.3,
};

const TABLE_COLUMNS = [
  { key: 'label', label: '' },
  { key: 'ocupacion', label: 'Ocupación', render: (r) => `${r.ocupacion}%` },
  { key: 'disponibilidad', label: 'Disponibilidad', render: (r) => `${r.disponibilidad}%` },
  { key: 'rotacion', label: 'Rotación', render: (r) => r.rotacion },
  { key: 'limpieza', label: 'T. limpieza (prom.)', render: (r) => `${r.limpieza} min` },
  {
    key: 'fueraServicio', label: 'Camas fuera de servicio', render: (r) => `${r.fueraServicio} (${r.fueraServicioPct}%)`,
  },
];

function TendenciaIndicator({ variacion, unidad, favorableWhen }) {
  const esPositivoNumerico = variacion > 0;
  const esFavorable = favorableWhen === 'up' ? esPositivoNumerico : !esPositivoNumerico;
  const Icon = esPositivoNumerico ? LuArrowUp : LuArrowDown;
  return (
    <span className={`cbin-kpi-trend ${esFavorable ? 'favorable' : 'desfavorable'}`}>
      <Icon className="icon" aria-hidden="true" />
      {Math.abs(variacion)}{unidad} vs. período anterior
    </span>
  );
}

// "Indicadores" — centro analítico del módulo (encargo: "más analítico y
// profundo que Resumen"): filtrar → analizar → comparar → profundizar →
// exportar, nunca operar (Bed Board) ni repetir el rol de Resumen (encargo
// secciones 21-22). Los 6 tabs comparten UNA estructura de análisis
// (evolución + por servicio + por sede + 2 tablas comparativas siempre
// completas) en vez de 6 pantallas independientes — ver TABS en
// mockIndicadoresData.js.
export default function GestionCamasIndicadores() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [sede, setSede] = useState('todas');
  const [servicio, setServicio] = useState('todos');
  const [periodo, setPeriodo] = useState('30d');
  const [personalizadoDesde, setPersonalizadoDesde] = useState('');
  const [personalizadoHasta, setPersonalizadoHasta] = useState('');
  const [tab, setTab] = useState('ocupacion');
  const [granularidad, setGranularidad] = useState('diario');

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [retryToken, setRetryToken] = useState(0);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  // Simulación de carga (encargo sección 20: loading/error reales, no solo
  // decorativos) — el efecto solo resuelve la promesa async (setTimeout);
  // "loading" se marca en el propio handler del filtro que la dispara (ver
  // handleChangeSede/etc. abajo), nunca de forma síncrona en el cuerpo del
  // efecto (AGENTS.md / react-hooks/set-state-in-effect), mismo criterio que
  // GestionCamasCamas.jsx/GestionCamasIntegridad.jsx.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setStatus(Math.random() < 0.06 ? 'error' : 'ready');
    }, 450);
    return () => window.clearTimeout(t);
  }, [sede, servicio, periodo, personalizadoDesde, personalizadoHasta, tab, granularidad, retryToken]);

  function handleChangeSede(v) { setStatus('loading'); setSede(v); }
  function handleChangeServicio(v) { setStatus('loading'); setServicio(v); }
  function handleChangePeriodo(v) { setStatus('loading'); setPeriodo(v); }
  function handleChangeTab(v) { setStatus('loading'); setTab(v); }
  function handleChangeGranularidad(v) { setStatus('loading'); setGranularidad(v); }
  function handleLimpiarFiltros() {
    setStatus('loading');
    setSede('todas');
    setServicio('todos');
    setPeriodo('30d');
    setPersonalizadoDesde('');
    setPersonalizadoHasta('');
  }
  function handleRetry() { setStatus('loading'); setRetryToken((t) => t + 1); }
  function handleExport(formato) {
    showToast(`Exportando indicadores en ${formato.toUpperCase()} (en desarrollo).`);
  }

  const tabConfig = TAB_BY_ID[tab];

  // Encargo, sección 16: los filtros aplican a TODOS los indicadores.
  // Servicio/Sede acotan el número principal (KPI/evolución) a esa única
  // fila — cuando ambos están acotados a la vez no hay un dato cruzado que
  // el mock modele (ver INDICADORES_POR_SERVICIO/SEDE, cada uno es un corte
  // distinto), así que ese caso puntual muestra el estado "Sin datos"
  // (sección 20) en vez de fabricar un número — las 2 tablas/cards
  // comparativas de abajo siguen mostrando el panorama completo siempre,
  // no dependen de este recorte.
  const sinDatosParaSeleccion = servicio !== 'todos' && sede !== 'todas';
  const filaServicio = INDICADORES_POR_SERVICIO.find((r) => r.servicio === servicio);
  const filaSede = INDICADORES_POR_SEDE.find((r) => r.sede === sede);
  const filaFiltro = servicio !== 'todos' ? filaServicio : (sede !== 'todas' ? filaSede : null);

  const serie = useMemo(() => {
    const valorActual = filaFiltro ? filaFiltro[tabConfig.campo] : VALOR_GLOBAL_POR_TAB[tab];
    return generarSerie(valorActual, granularidad);
  }, [filaFiltro, tabConfig, tab, granularidad]);

  const filasServicio = useMemo(() => INDICADORES_POR_SERVICIO
    .map((r) => ({ label: SERVICIO_LABEL[r.servicio], valor: r[tabConfig.campo] }))
    .sort((a, b) => b.valor - a.valor), [tabConfig]);
  const filasSede = useMemo(() => INDICADORES_POR_SEDE
    .map((r) => ({ label: SEDE_LABEL[r.sede], valor: r[tabConfig.campo] }))
    .sort((a, b) => b.valor - a.valor), [tabConfig]);

  const tablaServicioRows = INDICADORES_POR_SERVICIO.map((r) => ({ label: SERVICIO_LABEL[r.servicio], ...r }));
  const tablaSedeRows = INDICADORES_POR_SEDE.map((r) => ({ label: SEDE_LABEL[r.sede], ...r }));

  const kpisMostrados = filaFiltro ? [
    {
      id: 'ocupacion', label: 'Ocupación', valor: filaFiltro.ocupacion, unidad: '%', variant: 'neutral',
    },
    {
      id: 'disponibilidad', label: 'Disponibilidad', valor: filaFiltro.disponibilidad, unidad: '%', variant: 'neutral',
    },
    {
      id: 'rotacion', label: 'Rotación', valor: filaFiltro.rotacion, unidad: '', descripcion: 'Pacientes / cama / día', variant: 'neutral',
    },
    {
      id: 'limpieza', label: 'T. limpieza (prom.)', valor: filaFiltro.limpieza, unidad: ' min', variant: 'warning',
    },
    {
      id: 'fueraServicio', label: 'Fuera de servicio', valor: filaFiltro.fueraServicio, unidad: '', descripcion: `${filaFiltro.fueraServicioPct}% del total`, variant: 'danger',
    },
  ] : null;

  const hayFiltrosActivos = sede !== 'todas' || servicio !== 'todos' || periodo !== '30d';

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Indicadores"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbin-content">
          <GestionCamasSidebar />

          <div className="cbin-page-body">
            <div className="cbin-header">
              <div>
                <h1>Indicadores de camas</h1>
                <p>Monitorea el desempeño y la utilización de las camas del hospital a través de métricas clave.</p>
              </div>
              <div className="cbin-header-filters">
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Servicio" options={SERVICIOS} value={servicio} onChange={handleChangeServicio} />
                <AreaSelector label="Periodo" options={PERIODOS} value={periodo} onChange={handleChangePeriodo} />
                <ExportarMenu onExport={handleExport} />
              </div>
            </div>

            {periodo === 'personalizado' && (
              <div className="cbin-periodo-custom">
                <LuCalendarClock className="icon" aria-hidden="true" />
                <label>
                  Desde
                  <input type="date" value={personalizadoDesde} onChange={(e) => setPersonalizadoDesde(e.target.value)} />
                </label>
                <label>
                  Hasta
                  <input type="date" value={personalizadoHasta} onChange={(e) => setPersonalizadoHasta(e.target.value)} />
                </label>
              </div>
            )}

            {hayFiltrosActivos && (
              <div className="cbin-filtros-activos">
                <span>Filtros:</span>
                {sede !== 'todas' && <span className="chip-filter active">{SEDE_LABEL[sede]}</span>}
                {servicio !== 'todos' && <span className="chip-filter active">{SERVICIO_LABEL[servicio]}</span>}
                {periodo !== '30d' && <span className="chip-filter active">{PERIODOS.find((p) => p.value === periodo)?.label}</span>}
                <button type="button" className="cbin-link-btn" onClick={handleLimpiarFiltros}>Limpiar filtros</button>
              </div>
            )}

            {status === 'loading' && <IndicadoresSkeleton />}

            {status === 'error' && (
              <IndicadoresEmptyState
                icon={LuCircleAlert}
                title="No fue posible cargar los indicadores."
                ctaLabel="Reintentar"
                onCta={handleRetry}
              />
            )}

            {status === 'ready' && (
              <>
                <div className="cbin-kpi-row">
                  {(kpisMostrados ?? KPI_PRINCIPALES).map((k) => (
                    <KpiCard
                      key={k.id}
                      icon={ICONO_POR_KPI[k.id]}
                      label={k.label}
                      value={`${k.valor}${k.unidad}`}
                      variant={k.variant ?? 'neutral'}
                      description={(
                        <>
                          {(k.metaLabel ?? k.descripcion) && <span className="cbin-kpi-desc-text">{k.metaLabel ?? k.descripcion}</span>}
                          {k.variacion !== undefined && (
                            <TendenciaIndicator variacion={k.variacion} unidad={k.unidadVariacion} favorableWhen={k.favorableWhen} />
                          )}
                        </>
                      )}
                    />
                  ))}
                </div>

                <div className="cbin-tabs" role="tablist" aria-label="Indicadores de camas">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`cbin-tab${tab === t.id ? ' active' : ''}`}
                      onClick={() => handleChangeTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {sinDatosParaSeleccion ? (
                  <IndicadoresEmptyState
                    icon={LuSearchX}
                    title="No hay datos suficientes para calcular este indicador."
                    subtitle="La combinación de Sede + Servicio seleccionada no tiene datos cruzados disponibles."
                    ctaLabel="Cambiar período"
                    onCta={() => handleChangePeriodo('90d')}
                  />
                ) : (
                  <>
                    {tab === 'tiempos' && (
                      <div className="cbin-tiempos-row">
                        {TIEMPOS_ADICIONALES.map((tstat) => (
                          <div className="cbin-tiempos-stat" key={tstat.id}>
                            <span className="cbin-tiempos-stat-label">{tstat.label}</span>
                            <span className="cbin-tiempos-stat-valor">{tstat.valor}{tstat.unidad}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="cbin-chart-row">
                      <div className="card cbin-trend-card">
                        <div className="cbin-card-head cbin-trend-head">
                          <div className="cbin-trend-title">
                            <h2>{tab === 'ocupacion' ? 'Ocupación de camas' : `${tabConfig.label} — evolución`}</h2>
                            <InfoTooltip texto={tabConfig.tooltip} />
                          </div>
                          <AreaSelector options={GRANULARIDADES} value={granularidad} onChange={handleChangeGranularidad} />
                        </div>
                        <div className="cbin-trend-body">
                          <TendenciaChart serie={serie} unidad={tabConfig.unidad} meta={tabConfig.meta} />
                        </div>
                      </div>

                      <BarrasComparativas
                        titulo={`${tabConfig.label} por servicio`}
                        filas={filasServicio}
                        unidad={tabConfig.unidad}
                        ctaLabel="Ver todos los servicios"
                        onCta={() => showToast('Detalle completo por servicio (en desarrollo).')}
                      />
                      <BarrasComparativas
                        titulo={`${tabConfig.label} por sede`}
                        filas={filasSede}
                        unidad={tabConfig.unidad}
                        ctaLabel="Ver todas las sedes"
                        onCta={() => showToast('Detalle completo por sede (en desarrollo).')}
                      />
                    </div>

                    {tab === 'fuera-servicio' && (
                      <BarrasComparativas
                        titulo="Principales motivos"
                        filas={MOTIVOS_FUERA_SERVICIO.map((m) => ({ label: m.motivo, valor: m.pct }))}
                        unidad="%"
                      />
                    )}

                    <IndicadoresTable titulo="Indicadores por servicio" columns={TABLE_COLUMNS} rows={tablaServicioRows} />
                    <IndicadoresTable titulo="Indicadores por sede" columns={TABLE_COLUMNS} rows={tablaSedeRows} />
                  </>
                )}

                <div className="cbin-footer-note">
                  Los indicadores se calculan con datos hasta el {formatFechaHora(ULTIMA_ACTUALIZACION)}.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`cbin-toast${toast ? ' show' : ''}`}>
        <span className="cbin-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
