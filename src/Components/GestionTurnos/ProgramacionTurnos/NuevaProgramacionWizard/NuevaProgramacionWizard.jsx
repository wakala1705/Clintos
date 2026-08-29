'use client';

import { useEffect, useRef, useState } from 'react';
import './NuevaProgramacionWizard.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PeriodoAreaStep from './PeriodoAreaStep/PeriodoAreaStep';
import SeleccionarPersonalStep from './SeleccionarPersonalStep/SeleccionarPersonalStep';
import ConfirmarStep from './ConfirmarStep/ConfirmarStep';
import {
  NURSES, periodKeyDeMes, periodKeyDeSemana, primerLunesVisibleDelMes, rangoSemanaLabel, mesLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuCalendarPlus } from 'react-icons/lu';

const PASOS = [
  { n: 1, label: 'Período y área' },
  { n: 2, label: 'Seleccionar personal' },
  { n: 3, label: 'Confirmar programación' },
];

// Wizard de 3 pasos "Nueva programación de turnos" (encargo sección 2).
// Estado del formulario vive acá y se pasa controlado a cada paso — mismo
// patrón que el resto de modales de formulario del proyecto (form/setForm
// local, sin librería de formularios). "Todas las áreas" no es un valor
// válido para crear una programación (encargo sección 2) — si el wizard se
// abre desde el filtro de header en 'todas' (o desde el botón del estado
// vacío, sin filtro previo), `area` arranca vacío y obliga a elegir una.
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
  function clearAllNurses() {
    setNurseIds([]);
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

  const subtitle = PASOS[paso - 1].label;

  return (
    <div className="modal-overlay open">
      <div className="modal-card npw-modal-card" role="dialog" aria-modal="true" aria-labelledby="npw-title">
        <ModalHeader
          icon={LuCalendarPlus}
          tone="primary"
          title="Nueva programación de turnos"
          titleId="npw-title"
          subtitle="Define el período y el personal que participará en esta programación."
          onClose={onClose}
        />

        <div className="npw-progress" aria-label={`Paso ${paso} de 3: ${subtitle}`}>
          {PASOS.map((p) => (
            <div key={p.n} className={`npw-progress-step${paso === p.n ? ' active' : ''}${paso > p.n ? ' done' : ''}`}>
              <span className="npw-progress-dot">{p.n}</span>
              <span className="npw-progress-label">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="modal-body npw-body">
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
              onClearAll={clearAllNurses}
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

        <div className="modal-footer">
          {paso === 1 && <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>}
          {paso > 1 && <button type="button" className="btn btn-secondary" onClick={() => setPaso((p) => p - 1)}>Atrás</button>}
          {paso < 3 && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={(paso === 1 && !area) || (paso === 2 && nurseIds.length === 0)}
              onClick={() => setPaso((p) => p + 1)}
            >
              Continuar
            </button>
          )}
          {paso === 3 && (
            <button type="button" className="btn btn-primary" onClick={handleConfirmar}>Crear programación</button>
          )}
        </div>
      </div>
    </div>
  );
}
