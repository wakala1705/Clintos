'use client';

import { useEffect, useState } from 'react';
import './DetalleCirugiaPanel.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import ProcedimientosSideList from './ProcedimientosSideList/ProcedimientosSideList';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import DevolucionesCirugiaModal from '../modals/DevolucionesCirugiaModal/DevolucionesCirugiaModal';
import { ESTADOS_TERMINALES_CIRUGIA, edadDetalleLabel, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuBan, LuCalendarClock, LuCalendarX, LuCheckCheck, LuPencil, LuRefreshCw, LuUser,
} from 'react-icons/lu';

// Tabs del panel derecho del split (ver .dcp-split más abajo).
// "Procedimientos" no es una tab: es la lista fija de la izquierda (mismo
// esquema que .hqd-split en IntervencionDetalleModal, HistorialQuirurgico).
// Sin tab "Farmacia" (encargo explícito): la solicitud a farmacia se ve y se
// hace desde Insumos.
const DETAIL_TABS = [
  { id: 'insumos', label: 'Insumos' },
  { id: 'personal', label: 'Personal clínico' },
  { id: 'equipos', label: 'Equipos' },
];

function InfoItem({ label, value, wide = false }) {
  return (
    <div className={`dcp-info-item${wide ? ' wide' : ''}`}>
      <div className="dcp-info-label">{label}</div>
      <div className="dcp-info-value">{value}</div>
    </div>
  );
}

// Modal centrado superpuesto (nunca docked en el layout) -- mismo patrón
// que el resto de modales de esta feature (.modal-overlay/.modal-card, ver
// shared/shared.css). Antes era un drawer deslizante de 420px: se angostaba
// demasiado para 6 tabs + el bloque de datos del paciente (encargo
// explícito). `onClose` deselecciona y cierra el modal.
export default function DetalleCirugiaPanel({
  cirugia, onClose, onEditar, onReprogramar, onCancelar,
  onMarcarRealizada, onMarcarIncumplida, onPedirInsumos,
  onRegistrarEntrega, onGuardarDevolucion, onAnularDevolucion,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('insumos');
  // Ventana "Devoluciones en Cirugías" (se abre desde
  // "Devolver insumos" de la tab Insumos) montada encima de este modal.
  const [devolucionesAbierto, setDevolucionesAbierto] = useState(false);
  // Resetear la tab de detalle activa a "insumos" al cambiar de cirugía sin
  // un useEffect (evita el cascading-render que marca
  // react-hooks/set-state-in-effect): mismo patrón "ajustar estado durante
  // el render" que recomienda React para derivar estado de un prop que
  // cambia, comparando contra el id anterior guardado en estado.
  const [lastCirugiaId, setLastCirugiaId] = useState(cirugia?.id ?? null);
  // Selección de la lista de procedimientos del split (ver .dcp-split más
  // abajo) -- mismo truco "ajustar estado durante el render" que
  // `lastCirugiaId`, para resetear a la primera fila al cambiar de cirugía.
  const [selectedProcedimientoId, setSelectedProcedimientoId] = useState(
    cirugia?.procedimientos[0]?.nombre ?? null,
  );
  if ((cirugia?.id ?? null) !== lastCirugiaId) {
    setLastCirugiaId(cirugia?.id ?? null);
    setActiveDetailTab('insumos');
    setDevolucionesAbierto(false);
    setSelectedProcedimientoId(cirugia?.procedimientos[0]?.nombre ?? null);
  }

  useEffect(() => {
    // Con Devoluciones abierta encima, Escape cierra solo esa ventana (su
    // propio onKeyDown), no también el detalle.
    if (!cirugia || devolucionesAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cirugia, onClose, devolucionesAbierto]);

  function handleDetailTabsKeyDown(e) {
    const idx = DETAIL_TABS.findIndex((t) => t.id === activeDetailTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % DETAIL_TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + DETAIL_TABS.length) % DETAIL_TABS.length;
    else return;
    e.preventDefault();
    setActiveDetailTab(DETAIL_TABS[next].id);
  }

  if (!cirugia) return null;

  const puedeAccionar = !ESTADOS_TERMINALES_CIRUGIA.includes(cirugia.estado);
  const puedeMarcarIncumplida = cirugia.estado === 'programada';

  const body = (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        onClose={onClose}
        closeLabel="Cerrar detalle"
      />

      {/* Mismos 12 campos del formulario legacy de referencia, agrupados en
          2 bloques: Programación (lo que identifica la cirugía, destacado,
          con el estado como un campo más de su grilla) y Paciente (datos de contexto). */}
      <div className="dcp-info">
        <section className="dcp-info-group dcp-info-group-prog" aria-label="Programación">
          <div className="dcp-info-group-title">
            <LuCalendarClock className="dcp-info-group-icon" aria-hidden="true" />
            Programación
          </div>
          <div className="dcp-info-grid">
            <InfoItem label="Fecha" value={`${fechaLabel(cirugia.fecha)} ${cirugia.horaInicio}`} />
            <InfoItem label="No. Prog" value={cirugia.id} />
            <InfoItem label="Cirujano" value={cirugia.cirujano || '—'} />
            <InfoItem label="Estado" value={<EstadoCirugiaBadge estado={cirugia.estado} />} />
          </div>
        </section>
        <section className="dcp-info-group dcp-info-group-pac" aria-label="Paciente">
          <div className="dcp-info-group-title">
            <LuUser className="dcp-info-group-icon" aria-hidden="true" />
            Paciente
          </div>
          <div className="dcp-info-grid">
            <InfoItem label="Nombre" value={cirugia.paciente.nombre} />
            <InfoItem label="Doc. Id" value={cirugia.paciente.documento} />
            <InfoItem label="Edad" value={edadDetalleLabel(cirugia.paciente)} />
            <InfoItem label="Sexo" value={cirugia.paciente.sexo} />
            <InfoItem label="Aseguradora" value={cirugia.paciente.aseguradora} />
            <InfoItem label="Tel. Aviso" value={cirugia.paciente.telAviso || '—'} />
            <InfoItem label="Nivel" value={cirugia.paciente.nivel || '—'} />
            <InfoItem label="Tipo Afiliado" value={cirugia.paciente.tipoAfiliado || '—'} />
            <InfoItem label="Dirección" value={cirugia.paciente.direccion || '—'} wide />
          </div>
        </section>
      </div>

      {/* Split de 2 columnas -- mismo esquema que .hqd-split
          (IntervencionDetalleModal, HistorialQuirurgico, ver comentario en
          DetalleCirugiaPanel.css): izquierda, la lista fija de procedimientos
          de la cirugía; derecha, tabs anidadas Insumos/Personal
          clínico/Equipos. Reemplaza a las 6 tabs de nivel superior que tenía
          antes el modal (Resumen se eliminó, Procedimientos pasó a ser la
          columna izquierda permanente en vez de una tab más) -- encargo
          explícito con esa captura de referencia. */}
      <div className="dcp-tab-body">
        <div className="dcp-split">
          <section className="dcp-split-left">
            <div className="dcp-tabs-bar">
              <span className="dcp-tab active">Procedimientos</span>
            </div>
            <ProcedimientosSideList
              procedimientos={cirugia.procedimientos}
              selectedId={selectedProcedimientoId}
              onSelect={setSelectedProcedimientoId}
            />
          </section>

          <section className="dcp-split-right">
            <div className="dcp-tabs-bar" role="tablist" aria-label="Detalle de la cirugía" onKeyDown={handleDetailTabsKeyDown}>
              {DETAIL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDetailTab === tab.id}
                  aria-controls={`dcp-detail-panel-${tab.id}`}
                  tabIndex={activeDetailTab === tab.id ? 0 : -1}
                  className={`dcp-tab${activeDetailTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveDetailTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="dcp-split-right-body" role="tabpanel" id={`dcp-detail-panel-${activeDetailTab}`}>
              {activeDetailTab === 'insumos' && (
                <InsumosTab
                  cirugia={cirugia}
                  puedeAccionar={puedeAccionar}
                  onPedirInsumos={onPedirInsumos}
                  onRegistrarEntrega={onRegistrarEntrega}
                  onDevolverInsumos={() => setDevolucionesAbierto(true)}
                />
              )}
              {activeDetailTab === 'personal' && <PersonalTab cirugia={cirugia} />}
              {activeDetailTab === 'equipos' && <EquiposTab cirugia={cirugia} />}
            </div>
          </section>
        </div>
      </div>

      {/* Editar/Reprogramar a la vista; los cambios de estado (realizada,
          incumplida, cancelar) agrupados en "Cambiar estado" -- mismos
          bloques y reglas de disabled que CirugiaCardMenu.jsx. Textos en
          color neutro (encargo explícito); solo los íconos de incumplida/
          cancelar llevan tono (iconTone), y Cancelar va separado para evitar
          clics por error. La acción
          principal ("Pedir insumos a farmacia") vive en el pie de la tabla
          de Insumos (ver InsumosTab.jsx). */}
      <div className="dcp-actions">
        <Button variant="secondary-accent" icon={LuPencil} disabled={!puedeAccionar} onClick={() => onEditar(cirugia)}>Editar</Button>
        <Button variant="secondary-accent" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={() => onReprogramar(cirugia)}>Reprogramar</Button>
        <DropdownMenu
          label="Cambiar estado de la cirugía"
          triggerLabel="Cambiar estado"
          triggerIcon={LuRefreshCw}
          items={[
            {
              id: 'realizada', label: 'Marcar como realizada', icon: LuCheckCheck, disabled: !puedeAccionar, onSelect: () => onMarcarRealizada(cirugia),
            },
            {
              id: 'incumplida', label: 'Marcar como incumplida', icon: LuCalendarX, iconTone: 'warn', disabled: !puedeMarcarIncumplida, onSelect: () => onMarcarIncumplida(cirugia),
            },
            {
              id: 'cancelar', label: 'Cancelar cirugía', icon: LuBan, iconTone: 'danger', disabled: !puedeAccionar, onSelect: () => onCancelar(cirugia), dividerBefore: true,
            },
          ]}
        />
      </div>
    </>
  );

  return (
    <>
      <div className="modal-overlay open" role="presentation" onClick={onClose}>
        <div
          className="modal-card dcp-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dcp-title"
          onClick={(e) => e.stopPropagation()}
        >
          {body}
        </div>
      </div>
      {devolucionesAbierto && (
        <DevolucionesCirugiaModal
          cirugia={cirugia}
          onGuardar={(datos) => onGuardarDevolucion(cirugia, datos)}
          onAnular={(consecutivo) => onAnularDevolucion(cirugia, consecutivo)}
          onClose={() => setDevolucionesAbierto(false)}
        />
      )}
    </>
  );
}
