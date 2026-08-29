'use client';

import { useEffect, useRef, useState } from 'react';
import './NuevaProgramacionWizard.css';
import PeriodoAreaStep from './PeriodoAreaStep/PeriodoAreaStep';
import SeleccionarPersonalStep from './SeleccionarPersonalStep/SeleccionarPersonalStep';
import ConfirmarStep from './ConfirmarStep/ConfirmarStep';
import {
  AREA_TURNO_LABEL, NURSES, periodKeyDeMes, periodKeyDeSemana, primerLunesVisibleDelMes, rangoSemanaLabel, mesLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import {
  LuArrowRight, LuCheck, LuChevronLeft, LuX,
} from 'react-icons/lu';

const PASOS = [
  { n: 1, titulo: 'Período y área', sub: 'Define cuándo y dónde se programarán los turnos.' },
  { n: 2, titulo: 'Personal', sub: 'Selecciona quién participará.' },
  { n: 3, titulo: 'Confirmar', sub: 'Revisa la configuración antes de crear.' },
];

// Wizard de 3 pasos "Nueva programación de turnos" (encargo sección 2),
// migrado al patrón de riel izquierdo + contenido dinámico del wizard
// "Nueva cita" (ver AGENTS.md sección "Modales" — .wizard-rail/.wizard-main
// de NuevaCitaFlow.css es un flujo legacy-imperativo compartido entre rutas;
// acá se replica su mismo lenguaje visual con clases propias `npw-*` porque
// este wizard es React puro y vive solo en GestionTurnos, mismo criterio de
// no-duplicar-un-componente-compartido que el resto del proyecto). Estado
// del formulario vive acá y se pasa controlado a cada paso — sin cambios de
// lógica funcional respecto a la versión con stepper horizontal.
export default function NuevaProgramacionWizard({
  initialWeekStart, initialArea, onClose, onCreate,
}) {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState('semana');
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [monthStart, setMonthStart] = useState(
    () => new Date(initialWeekStart.getFullYear(), initialWeekStart.getMonth(), 1),
  );
  const [area, setArea] = useState(initialArea && initialArea !== 'todas' ? initialArea : '');
  // Arranca con todo el personal elegible del área ya tildado (encargo, paso
  // 2: la mayoría ya viene marcada) — "elegible" = pertenece a esa área, ver
  // SeleccionarPersonalStep. Se re-siembra cada vez que cambia el área
  // (abajo) para no dejar tildado a alguien fuera del área recién elegida;
  // el `useRef` evita que el primer render (mismo valor que el estado
  // inicial) dispare un segundo reseteo redundante.
  const [nurseIds, setNurseIds] = useState(
    () => NURSES.filter((n) => n.area === area).map((n) => n.id),
  );
  const areaAnterior = useRef(area);
  useEffect(() => {
    if (areaAnterior.current === area) return;
    areaAnterior.current = area;
    setNurseIds(NURSES.filter((n) => n.area === area).map((n) => n.id));
  }, [area]);

  function toggleNurse(id) {
    setNurseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleTodos(nurseList, marcar) {
    setNurseIds((prev) => {
      const next = new Set(prev);
      nurseList.forEach((n) => { if (marcar) next.add(n.id); else next.delete(n.id); });
      return [...next];
    });
  }
  function handleConfirmar() {
    const periodKey = tipo === 'semana' ? periodKeyDeSemana(weekStart) : periodKeyDeMes(monthStart);
    const periodLabel = tipo === 'semana' ? rangoSemanaLabel(weekStart) : mesLabel(monthStart);
    const schedule = Object.fromEntries(
      nurseIds.map((id) => [id, Array.from({ length: 7 }, () => ({ estado: 'vacio' }))]),
    );
    onCreate({
      periodKey,
      programacion: {
        id: `prog-${periodKey}`,
        tipo,
        periodKey,
        periodLabel,
        area,
        nurseIds,
        estado: 'borrador',
        schedule,
      },
      weekStart: tipo === 'semana' ? weekStart : primerLunesVisibleDelMes(monthStart),
      area,
    });
  }

  // "Completo" = el paso tiene sus propios datos requeridos llenos (paso 1:
  // área elegida; paso 2: al menos una enfermera; paso 3 no pide nada nuevo).
  // Gatea el botón Continuar del paso actual. Distinto de "alcanzable" —
  // puedeIrA(n) exige que TODOS los pasos anteriores a n estén completos,
  // para permitir/bloquear el salto directo a un paso desde el riel.
  const pasoCompleto = {
    1: !!area,
    2: !!area && nurseIds.length > 0,
    3: true,
  };
  function puedeIrA(n) {
    if (n <= paso) return true; // pasos ya visitados o el actual: siempre se puede volver
    for (let i = 1; i < n; i += 1) if (!pasoCompleto[i]) return false;
    return true;
  }

  const periodoLabel = tipo === 'semana' ? rangoSemanaLabel(weekStart) : mesLabel(monthStart);

  return (
    <div className="modal-overlay open">
      <div className="npw-modal" role="dialog" aria-modal="true" aria-labelledby="npw-title">
        <div className="npw-body">
          <nav className="npw-rail">
            <div className="npw-rail-header">
              <div className="npw-rail-eyebrow">Nueva programación</div>
              <h3 id="npw-title" className="npw-rail-title">Nueva programación de turnos</h3>
              <p className="npw-rail-desc">Define el período y el personal que participará en esta programación.</p>
            </div>

            <div className="npw-rail-summary">
              <div className="npw-rail-summary-title">Programación</div>
              <div className="npw-rail-summary-row">
                <span className="npw-rail-summary-k">Período</span>
                <span className="npw-rail-summary-v">{periodoLabel}</span>
              </div>
              {!!area && (
                <div className="npw-rail-summary-row">
                  <span className="npw-rail-summary-k">Área</span>
                  <span className="npw-rail-summary-v">{AREA_TURNO_LABEL[area]}</span>
                </div>
              )}
              {nurseIds.length > 0 && (
                <div className="npw-rail-summary-row">
                  <span className="npw-rail-summary-k">Personal</span>
                  <span className="npw-rail-summary-v">{nurseIds.length} enfermeras</span>
                </div>
              )}
            </div>

            <div className="npw-rail-nav">
              {PASOS.map((p) => {
                const done = p.n < paso;
                const active = p.n === paso;
                const locked = !puedeIrA(p.n);
                return (
                  <button
                    key={p.n}
                    type="button"
                    className={`npw-rail-step${active ? ' active' : ''}${done ? ' done' : ''}${locked ? ' locked' : ''}`}
                    disabled={locked}
                    onClick={() => setPaso(p.n)}
                  >
                    <span className="npw-rail-circle">{done ? <LuCheck /> : p.n}</span>
                    <span className="npw-rail-step-text">
                      <span className="npw-rail-step-title">{p.titulo}</span>
                      <span className="npw-rail-step-sub">{p.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="npw-main">
            <div className="npw-main-header">
              <span className="npw-main-progress">Paso {paso} de 3</span>
              <button type="button" className="npw-close" onClick={onClose} aria-label="Cerrar" title="Cerrar">
                <LuX className="icon" />
              </button>
            </div>

            <div className="npw-content">
              {paso === 1 && (
                <PeriodoAreaStep
                  tipo={tipo}
                  onTipoChange={setTipo}
                  weekStart={weekStart}
                  onWeekStartChange={setWeekStart}
                  monthStart={monthStart}
                  onMonthStartChange={setMonthStart}
                  area={area}
                  onAreaChange={setArea}
                />
              )}
              {paso === 2 && (
                <SeleccionarPersonalStep
                  area={area}
                  selectedIds={nurseIds}
                  onToggle={toggleNurse}
                  onToggleAll={toggleTodos}
                />
              )}
              {paso === 3 && (
                <ConfirmarStep
                  tipo={tipo}
                  weekStart={weekStart}
                  monthStart={monthStart}
                  area={area}
                  nurseIds={nurseIds}
                />
              )}
            </div>

            <div className="npw-footer">
              {paso === 1 && <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>}
              {paso > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => setPaso((p) => p - 1)}>
                  <LuChevronLeft className="icon" />Atrás
                </button>
              )}
              {paso < 3 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!pasoCompleto[paso]}
                  onClick={() => setPaso((p) => p + 1)}
                >
                  Continuar<LuArrowRight className="icon" />
                </button>
              )}
              {paso === 3 && (
                <button type="button" className="btn btn-primary" onClick={handleConfirmar}>Crear programación</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
