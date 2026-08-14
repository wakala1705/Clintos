'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './GrowthChartModal.css';
import {
  LuBan, LuChartNoAxesCombined, LuChevronLeft, LuChevronRight, LuCircleAlert, LuCircleCheck, LuOctagonAlert, LuX,
} from 'react-icons/lu';
import {
  ESTADO_LABEL, INDICADORES_GRAFICA, estadoDeClasificacion, muestrearCurvas, posicionPuntoActual,
} from './growthChartData';

const ICONO_ESTADO = {
  esperado: LuCircleCheck,
  alerta: LuCircleAlert,
  'fuera-de-rango': LuOctagonAlert,
  'no-aplica': LuBan,
};

// Dimensiones del viewBox (unidades SVG, no px de pantalla — el <svg> se
// escala solo vía width:100%/aspect-ratio en CSS). Márgenes fijos dejan
// espacio para labels de eje sin necesitar medir texto en runtime.
const W = 760;
const H = 300;
const PLOT = { x0: 58, x1: 742, y0: 16, y1: 250 };

function xScale(x, dominioX) {
  return PLOT.x0 + ((x - dominioX[0]) / (dominioX[1] - dominioX[0])) * (PLOT.x1 - PLOT.x0);
}
function yScale(y, dominioY) {
  return PLOT.y0 + (1 - (y - dominioY[0]) / (dominioY[1] - dominioY[0])) * (PLOT.y1 - PLOT.y0);
}
function puntosSvg(serie, dominioX, dominioY) {
  return serie.map((p) => `${xScale(p.x, dominioX).toFixed(1)},${yScale(p.y, dominioY).toFixed(1)}`).join(' ');
}

// Peso/Talla/PC son texto crudo del <input> de "09 Examen físico"
// (antropometria, ver ExamenFisicoStep.jsx) — '' antes de diligenciar, no
// un número; IMC es el único ya numérico (o null). Mismo criterio de '—'
// que edadLabel/sexo más abajo para "todavía no hay dato".
function formatMedida(valor, unidad) {
  return valor === '' || valor == null ? '—' : `${valor} ${unidad}`;
}

// Modal "Gráficas de crecimiento" — se abre desde el botón "ver evolución"
// de cada fila de GrowthIndicatorRow.jsx (antes solo disparaba un toast).
// `medicionesActuales` es el objeto {indicadorKey: opción|null} que
// CrecimientoStep.jsx ya deriva de su propio estado `indicadores` (la
// opción DE seleccionada en "Verificar el crecimiento", con su
// Clasificación y `z` ya calculados) — este modal NUNCA vuelve a decidir
// una clasificación por su cuenta, solo la visualiza sobre las curvas de
// referencia (ver disclaimer de datos en growthChartData.js). `examenFisico`
// ({peso,talla,pc,imc}) es Peso/Talla/PC/IMC ya diligenciados en "09 Examen
// físico" (antropometria, levantado hasta PlantillaCrecimt2.jsx — ver
// ExamenFisicoStep.jsx — porque este modal, 2 pasos después, necesita
// leerlos): mismo criterio de "nunca recalcula, solo repite el dato ya
// diligenciado" que medicionesActuales.
export default function GrowthChartModal({
  open, indicadorId, onIndicadorChange, onClose, sexo, edadLabel, edadMeses, medicionesActuales, nombrePaciente,
  examenFisico,
}) {
  const [hoverPunto, setHoverPunto] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const indicadorIndex = Math.max(0, INDICADORES_GRAFICA.findIndex((i) => i.key === indicadorId));
  const indicador = INDICADORES_GRAFICA[indicadorIndex];
  const seleccion = medicionesActuales[indicador.key] ?? null;
  const estado = seleccion ? estadoDeClasificacion(seleccion.clasificacion) : null;
  const IconoEstado = estado ? ICONO_ESTADO[estado] : null;

  const curvas = useMemo(
    () => muestrearCurvas(indicador.key, sexo, indicador.dominioX),
    [indicador.key, sexo, indicador.dominioX],
  );

  const dominioY = useMemo(() => {
    const todos = [...curvas.pMas3, ...curvas.pMenos3].map((p) => p.y);
    const min = Math.min(...todos);
    const max = Math.max(...todos);
    const pad = (max - min) * 0.08;
    return [Math.max(0, min - pad), max + pad];
  }, [curvas]);

  const puntoActual = useMemo(() => {
    if (!seleccion || edadMeses == null) return null;
    return posicionPuntoActual({ indicador, sexo, edadMeses, z: seleccion.z });
  }, [seleccion, indicador, sexo, edadMeses]);

  if (!open) return null;

  // Cicla circularmente (del último al primero y viceversa) — con solo 5
  // indicadores no vale la pena deshabilitar los extremos, se navega más
  // rápido dejando que "siguiente" desde IMC vuelva a Peso para la edad.
  function cambiarIndicador(delta) {
    const total = INDICADORES_GRAFICA.length;
    const next = (indicadorIndex + delta + total) % total;
    onIndicadorChange(INDICADORES_GRAFICA[next].key);
  }

  const px = puntoActual ? xScale(puntoActual.x, indicador.dominioX) : null;
  const py = puntoActual ? yScale(puntoActual.y, dominioY) : null;
  const ticksX = [];
  for (let x = indicador.dominioX[0]; x <= indicador.dominioX[1]; x += indicador.pasoX) ticksX.push(x);
  const ticksY = [0, 0.25, 0.5, 0.75, 1].map((f) => dominioY[0] + f * (dominioY[1] - dominioY[0]));

  return (
    <div className="modal-overlay gcm-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card gcm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gcm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header gcm-header">
          <div className="gcm-header-titles">
            <span className="pf-block-icon"><LuChartNoAxesCombined className="icon" aria-hidden="true" /></span>
            <h3 id="gcm-title">Gráfica de patrones de crecimiento OMS para niñas, niños y adolescentes menores de 18 años</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar gráficas de crecimiento"
            ref={closeRef}
            autoFocus
          >
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body gcm-body">
          <div className="gcm-toolbar">
            <div className="gcm-summary-row">
              <div className="gcm-summary-item gcm-summary-paciente">
                <span className="gcm-summary-label">Paciente</span>
                <span className="gcm-summary-value">{nombrePaciente ?? '—'}</span>
              </div>
              <div className="gcm-summary-item">
                <span className="gcm-summary-label">Edad</span>
                <span className="gcm-summary-value">{edadLabel ?? '—'}</span>
              </div>
              <div className="gcm-summary-item">
                <span className="gcm-summary-label">Sexo</span>
                <span className="gcm-summary-value">{sexo ?? '—'}</span>
              </div>

              <span className="gcm-summary-divider" aria-hidden="true" />

              <div className="gcm-summary-item">
                <span className="gcm-summary-label">Peso</span>
                <span className="gcm-summary-value">{formatMedida(examenFisico?.peso, 'Kg')}</span>
              </div>
              <div className="gcm-summary-item">
                <span className="gcm-summary-label">Talla</span>
                <span className="gcm-summary-value">{formatMedida(examenFisico?.talla, 'cm')}</span>
              </div>
              <div className="gcm-summary-item">
                <span className="gcm-summary-label">PC</span>
                <span className="gcm-summary-value">{formatMedida(examenFisico?.pc, 'cm')}</span>
              </div>
              <div className="gcm-summary-item">
                <span className="gcm-summary-label">IMC</span>
                <span className="gcm-summary-value">{examenFisico?.imc ? examenFisico.imc.toFixed(1) : '—'}</span>
              </div>
            </div>

            <div className="gcm-indicator-switcher" role="group" aria-label="Indicador de crecimiento">
              <button
                type="button"
                className="gcm-switcher-btn"
                onClick={() => cambiarIndicador(-1)}
                aria-label="Indicador anterior"
              >
                <LuChevronLeft className="icon" aria-hidden="true" />
              </button>
              <div className="gcm-switcher-label" aria-live="polite">
                <span className="gcm-switcher-text">{indicador.label}</span>
                <span className="gcm-switcher-count">{indicadorIndex + 1} / {INDICADORES_GRAFICA.length}</span>
              </div>
              <button
                type="button"
                className="gcm-switcher-btn"
                onClick={() => cambiarIndicador(1)}
                aria-label="Siguiente indicador"
              >
                <LuChevronRight className="icon" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="gcm-chart-card">
            <div className="gcm-chart-wrap">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="gcm-svg"
                role="img"
                aria-label={`Gráfica de ${indicador.label}, curvas de referencia OMS con la medición actual del paciente`}
              >
                {ticksY.map((ty) => (
                  <line
                    key={`gy-${ty}`}
                    className="gcm-gridline"
                    x1={PLOT.x0} x2={PLOT.x1}
                    y1={yScale(ty, dominioY)} y2={yScale(ty, dominioY)}
                  />
                ))}
                {ticksX.map((tx) => (
                  <line
                    key={`gx-${tx}`}
                    className="gcm-gridline"
                    x1={xScale(tx, indicador.dominioX)} x2={xScale(tx, indicador.dominioX)}
                    y1={PLOT.y0} y2={PLOT.y1}
                  />
                ))}

                <line className="gcm-axis" x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.y1} y2={PLOT.y1} />
                <line className="gcm-axis" x1={PLOT.x0} x2={PLOT.x0} y1={PLOT.y0} y2={PLOT.y1} />

                {ticksY.map((ty) => (
                  <text key={`ly-${ty}`} className="gcm-axis-label" x={PLOT.x0 - 8} y={yScale(ty, dominioY) + 4} textAnchor="end">
                    {Math.round(ty * 10) / 10}
                  </text>
                ))}
                {ticksX.map((tx) => (
                  <text key={`lx-${tx}`} className="gcm-axis-label" x={xScale(tx, indicador.dominioX)} y={PLOT.y1 + 20} textAnchor="middle">
                    {tx}
                  </text>
                ))}
                <text className="gcm-axis-title" x={(PLOT.x0 + PLOT.x1) / 2} y={H - 6} textAnchor="middle">{indicador.ejeXLabel}</text>
                <text className="gcm-axis-title" x={16} y={(PLOT.y0 + PLOT.y1) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(PLOT.y0 + PLOT.y1) / 2})`}>
                  {indicador.ejeYLabel}
                </text>

                <polyline className="gcm-curve gcm-curve-3" points={puntosSvg(curvas.pMas3, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-3" points={puntosSvg(curvas.pMenos3, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-2" points={puntosSvg(curvas.pMas2, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-2" points={puntosSvg(curvas.pMenos2, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-1" points={puntosSvg(curvas.pMas1, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-1" points={puntosSvg(curvas.pMenos1, indicador.dominioX, dominioY)} />
                <polyline className="gcm-curve gcm-curve-0" points={puntosSvg(curvas.p0, indicador.dominioX, dominioY)} />

                {puntoActual && (
                  <g
                    className="gcm-punto-actual"
                    tabIndex={0}
                    onMouseEnter={() => setHoverPunto(true)}
                    onMouseLeave={() => setHoverPunto(false)}
                    onFocus={() => setHoverPunto(true)}
                    onBlur={() => setHoverPunto(false)}
                    role="img"
                    aria-label={`Medición actual: edad ${edadLabel}, valor ${seleccion.label}`}
                  >
                    <circle cx={px} cy={py} r={11} className={`gcm-punto-halo gcm-estado-${estado}`} />
                    <circle cx={px} cy={py} r={6} className={`gcm-punto-dot gcm-estado-${estado}`} />
                    {hoverPunto && (
                      <g className="gcm-tooltip" transform={`translate(${Math.min(px + 14, PLOT.x1 - 158)}, ${Math.max(py - 46, PLOT.y0 + 2)})`}>
                        <rect width={158} height={40} rx={8} className="gcm-tooltip-bg" />
                        <text x={12} y={17} className="gcm-tooltip-text">Edad: {edadLabel}</text>
                        <text x={12} y={32} className="gcm-tooltip-text">Valor: {seleccion.label}</text>
                      </g>
                    )}
                  </g>
                )}
              </svg>
            </div>

            <div className="gcm-legend">
              <span className="gcm-legend-item"><i className="gcm-legend-swatch gcm-curve-0" />Mediana (0 DE)</span>
              <span className="gcm-legend-item"><i className="gcm-legend-swatch gcm-curve-1" />±1 DE</span>
              <span className="gcm-legend-item"><i className="gcm-legend-swatch gcm-curve-2" />±2 DE</span>
              <span className="gcm-legend-item"><i className="gcm-legend-swatch gcm-curve-3" />±3 DE</span>
              {puntoActual && (
                <span className="gcm-legend-item"><i className={`gcm-legend-dot gcm-estado-${estado}`} />Medición actual</span>
              )}
            </div>
          </div>

          <div className={`gcm-interpretation${estado ? ` gcm-interpretation-${estado}` : ''}`}>
            {seleccion ? (
              <>
                <div className="gcm-interpretation-row">
                  <p className="gcm-interpretation-text">
                    <span className="gcm-interpretation-label">Resultado</span>
                    {indicador.label}: {seleccion.clasificacion}
                  </p>
                  <span className={`gcm-estado-badge gcm-estado-${estado}`}>
                    {IconoEstado && <IconoEstado className="icon" aria-hidden="true" />}
                    {ESTADO_LABEL[estado]}
                  </span>
                </div>
                <p className="gcm-interpretation-meta">
                  Valor registrado: <b>{seleccion.label}</b> · Desviación estándar aproximada: <b>{seleccion.z > 0 ? '+' : ''}{seleccion.z} DE</b>
                </p>
              </>
            ) : (
              <p className="gcm-interpretation-empty">
                Aún no se ha registrado un valor para «{indicador.label}» en «Verificar el crecimiento».
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
