'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '../GestionCamas.css';
import './GestionCamasResumen.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import FormSelect from '@/Components/FormSelect/FormSelect';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import { SEDES, AREAS } from '@/hooks/GestionCamas/mockCamasData';
import {
  INCONSISTENCIAS, MOVIMIENTOS_RECIENTES, MOVIMIENTO_COLOR, OCUPACION_META_PCT,
  PERIODOS, RESUMEN_KPIS, TENDENCIA_INDICADORES, TENDENCIA_SERIE, ULTIMA_VERIFICACION_INTEGRIDAD,
  UTILIZACION_SERVICIOS,
} from '@/hooks/GestionCamas/mockResumenData';
import {
  LuArrowUpRight, LuBedDouble, LuChartColumn, LuChevronRight, LuCircleAlert, LuClock,
  LuServer, LuSettings, LuShieldCheck, LuSprayCan, LuTriangleAlert, LuUser, LuWrench,
} from 'react-icons/lu';

// Gráfica de línea de "Ocupación de camas" — SVG a mano (no hay librería de
// charts instalada, ver package.json) sobre un viewBox fijo 640×160 con
// escala 0–100 (los 3 indicadores intercambiables son todos porcentajes,
// mismo eje sin importar cuál esté activo). Componente local, solo lo usa
// esta pantalla (mismo criterio que BloqueContextual en BedCard.jsx).
function TrendChart({ data, field, metaPct }) {
  const width = 640;
  const height = 160;
  const padding = {
    top: 16, right: 8, bottom: 8, left: 8,
  };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (innerW * i) / (data.length - 1),
    y: padding.top + innerH * (1 - d[field] / 100),
    value: d[field],
    fecha: d.fecha,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;
  const metaY = padding.top + innerH * (1 - metaPct / 100);

  return (
    <div className="cbr-trend-chart">
      <svg
        className="cbr-trend-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Tendencia de ${field} de los últimos ${data.length} días, meta ${metaPct}%`}
      >
        <path className="cbr-trend-area" d={areaPath} />
        <line className="cbr-trend-meta-line" x1={padding.left} x2={width - padding.right} y1={metaY} y2={metaY} />
        <path className="cbr-trend-line" d={linePath} />
        {points.map((p) => <circle key={p.fecha} className="cbr-trend-dot" cx={p.x} cy={p.y} r="3.5" />)}
      </svg>
      <div className="cbr-trend-meta-label">Meta {metaPct}%</div>
      <div className="cbr-trend-labels">
        {points.map((p) => (
          <div className="cbr-trend-label-item" key={p.fecha}>
            <span className="cbr-trend-label-value">{p.value}%</span>
            <span className="cbr-trend-label-date">{p.fecha}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UtilizationBars({ data }) {
  return (
    <div className="cbr-util-list">
      {data.map((s) => (
        <div className="cbr-util-row" key={s.servicio}>
          <div className="cbr-util-row-top">
            <span className="cbr-util-servicio">{s.servicio}</span>
            <span className="cbr-util-pct">{s.pct}%</span>
          </div>
          <div className="cbr-util-bar">
            <div className="cbr-util-bar-fill" style={{ width: `${s.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const ICONO_INCONSISTENCIA = {
  advertencia: { icon: LuTriangleAlert, tone: 'amber' },
  alerta: { icon: LuCircleAlert, tone: 'red' },
};

// Pantalla administrativa "Resumen" (Procesos > Gestión de Camas > Resumen,
// ver AGENTS.md/encargo) — reemplaza al viejo /gestion-camas como landing
// del módulo; el antiguo Bed Board operativo (asignar paciente, trasladar,
// tareas de limpieza...) se movió intacto a /gestion-camas/camas (ver
// GestionCamas.jsx) y es deliberadamente la ÚNICA pantalla del módulo que
// muestra esas acciones — esta, en cambio, es supervisión + indicadores +
// integridad + auditoría, sin protagonismo del paciente ni acciones
// clínicas/operativas en tiempo real (encargo explícito, sección 10).
//
// Sede/Servicio/Periodo son selectores controlados de verdad, pero el mock
// (mockResumenData.js) no modela un desglose por cada combinación de los
// 3 — solo trae el dataset agregado que pidió el encargo (512 camas, etc.),
// así que cambiarlos no recalcula los KPIs/gráficas todavía (mismo criterio
// de "no inventar datos que el mock no modela" que el resto del proyecto,
// ver p. ej. mockPanelGeneralData.js).
export default function GestionCamasResumen() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [sede, setSede] = useState('todas');
  const [servicio, setServicio] = useState('todas');
  const [periodo, setPeriodo] = useState('30d');
  const [indicador, setIndicador] = useState('ocupacion');

  function irASeccion(label) {
    window.ncToast?.(`${label} (en desarrollo).`);
  }

  const kpis = RESUMEN_KPIS;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Resumen"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbr-content">
          <GestionCamasSidebar />

          <div className="cbr-page-body">
            <div className="cbr-header">
              <div>
                <h1>Resumen de Gestión de Camas</h1>
                <p>Monitorea los indicadores clave y el estado general de las camas del hospital.</p>
              </div>
              <div className="cbr-header-filters">
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={setSede} />
                <AreaSelector label="Servicio" options={AREAS} value={servicio} onChange={setServicio} />
                <AreaSelector label="Periodo" options={PERIODOS} value={periodo} onChange={setPeriodo} />
              </div>
            </div>

            <div className="cbr-kpi-row">
              <KpiCard icon={LuBedDouble} label="Total de camas" value={kpis.total} description="En todas las sedes" variant="neutral" />
              <KpiCard
                icon={LuShieldCheck}
                label="Camas habilitadas"
                value={kpis.habilitadas}
                description={`${kpis.habilitadasPct}% del total`}
                variant="neutral"
              />
              <KpiCard
                icon={LuUser}
                label="Camas ocupadas"
                value={kpis.ocupadas}
                description={(
                  <>
                    {kpis.ocupacionPct}% de ocupación
                    <span className="cbr-kpi-trend up">
                      <LuArrowUpRight className="icon" aria-hidden="true" />
                      {kpis.ocupacionTrendPct}% vs. período anterior
                    </span>
                  </>
                )}
                variant="neutral"
                progress={{ percent: kpis.ocupacionPct }}
              />
              <KpiCard
                icon={LuSprayCan}
                label="En limpieza"
                value={kpis.limpieza}
                description={`${kpis.limpiezaPct}% del total`}
                variant="warning"
              />
              <KpiCard
                icon={LuWrench}
                label="En mantenimiento"
                value={kpis.mantenimiento}
                description={`${kpis.mantenimientoPct}% del total`}
                variant="warning"
              />
              <KpiCard
                icon={LuServer}
                label="Fuera de servicio"
                value={kpis.fueraDeServicio}
                description={`${kpis.fueraDeServicioPct}% del total`}
                variant="danger"
              />
            </div>

            <div className="cbr-main-row">
              <div className="card cbr-occupancy-card">
                <div className="cbr-card-head">
                  <h2>Ocupación de camas</h2>
                  <div className="cbr-indicador-select">
                    <FormSelect id="cbr-indicador" value={indicador} onChange={setIndicador} options={TENDENCIA_INDICADORES} />
                  </div>
                </div>
                <TrendChart data={TENDENCIA_SERIE} field={indicador} metaPct={OCUPACION_META_PCT} />
              </div>

              <div className="card cbr-utilization-card">
                <div className="cbr-card-head">
                  <h2>Utilización por servicio</h2>
                </div>
                <UtilizationBars data={UTILIZACION_SERVICIOS} />
                <div className="cbr-card-footer-link">
                  <button type="button" className="cbr-link-btn" onClick={() => irASeccion('Indicadores')}>
                    Ver más indicadores
                    <LuChevronRight className="icon" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="card cbr-integrity-card">
                {/* El contador "N inconsistencias" que vivía acá se trasladó
                    al ítem "Integridad" del sidebar del módulo (encargo — ver
                    GestionCamasSidebar.jsx), para no duplicarlo en 2 lugares
                    a la vez. */}
                <div className="cbr-card-head">
                  <h2>Control de integridad de camas</h2>
                </div>

                <div className="cbr-integrity-list">
                  {INCONSISTENCIAS.map((inc) => {
                    const { icon: Icon, tone } = ICONO_INCONSISTENCIA[inc.severidad];
                    return (
                      <button
                        type="button"
                        key={inc.id}
                        className="cbr-integrity-item"
                        onClick={() => irASeccion('Corrección de inconsistencia')}
                      >
                        <span className={`cbr-integrity-icon tone-${tone}`}>
                          <Icon className="icon" aria-hidden="true" />
                        </span>
                        <span className="cbr-integrity-text">
                          <span className="cbr-integrity-title">{inc.titulo}</span>
                          <span className="cbr-integrity-detalle">{inc.detalle}</span>
                          <span className="cbr-integrity-detalle">{inc.servicio}</span>
                        </span>
                        <LuChevronRight className="icon cbr-integrity-chev" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                <div className="cbr-integrity-footer">
                  <span className="cbr-integrity-check">
                    <LuClock className="icon" aria-hidden="true" />
                    Última verificación: {ULTIMA_VERIFICACION_INTEGRIDAD}
                  </span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => irASeccion('Verificación de integridad')}>
                    Verificar ahora
                  </button>
                </div>
                <div className="cbr-card-footer-link">
                  <button type="button" className="cbr-link-btn" onClick={() => irASeccion('Integridad')}>
                    Ver todas las inconsistencias
                    <LuChevronRight className="icon" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="cbr-bottom-row">
              <div className="card cbr-audit-card">
                <div className="cbr-card-head">
                  <h2>Últimos movimientos</h2>
                  <button type="button" className="cbr-link-btn" onClick={() => irASeccion('Auditoría / Historial')}>
                    Ver auditoría completa
                    <LuChevronRight className="icon" aria-hidden="true" />
                  </button>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha / Hora</th>
                        <th>Cama</th>
                        <th>Servicio</th>
                        <th>Movimiento</th>
                        <th>Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOVIMIENTOS_RECIENTES.map((m) => (
                        <tr key={m.id}>
                          <td className="cell-muted">{m.fecha}</td>
                          <td className="cell-primary">{m.cama}</td>
                          <td className="cell-muted">{m.servicio}</td>
                          <td>
                            <span className={`cbr-mov-badge cbr-mov-${MOVIMIENTO_COLOR[m.movimiento]}`}>{m.movimiento}</span>
                          </td>
                          <td className="cell-muted">{m.usuario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="cbr-quick-access">
                <Link className="cbr-quick-card" href="/gestion-camas/camas">
                  <span className="cbr-quick-icon"><LuBedDouble className="icon" aria-hidden="true" /></span>
                  <span className="cbr-quick-title">Gestionar camas</span>
                  <span className="cbr-quick-desc">Crear, editar y activar camas</span>
                </Link>
                <button type="button" className="cbr-quick-card" onClick={() => irASeccion('Configuración')}>
                  <span className="cbr-quick-icon"><LuSettings className="icon" aria-hidden="true" /></span>
                  <span className="cbr-quick-title">Configurar catálogos</span>
                  <span className="cbr-quick-desc">Tipos, estados y motivos</span>
                </button>
                <button type="button" className="cbr-quick-card" onClick={() => irASeccion('Integridad')}>
                  <span className="cbr-quick-icon"><LuShieldCheck className="icon" aria-hidden="true" /></span>
                  <span className="cbr-quick-title">Revisar integridad</span>
                  <span className="cbr-quick-desc">Detectar y corregir inconsistencias</span>
                </button>
                <button type="button" className="cbr-quick-card" onClick={() => irASeccion('Indicadores')}>
                  <span className="cbr-quick-icon"><LuChartColumn className="icon" aria-hidden="true" /></span>
                  <span className="cbr-quick-title">Ver indicadores</span>
                  <span className="cbr-quick-desc">Ocupación, rotación y utilización</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
