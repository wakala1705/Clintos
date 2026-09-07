'use client';

import { useEffect, useRef, useState } from 'react';
import './DetalleCirugiaPanel.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import ProcedimientosSideList from './ProcedimientosSideList/ProcedimientosSideList';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import FarmaciaTab from './tabs/FarmaciaTab/FarmaciaTab';
import { edadDetalleLabel, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuBan, LuCalendarClock, LuChevronUp, LuCircleCheck, LuInfo, LuPencil,
} from 'react-icons/lu';

const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

// Tabs del panel derecho del split (ver .dcp-split más abajo) -- reemplazan
// a las 4 tabs de nivel superior que tenía antes el modal (Personal/Equipos/
// Insumos/Farmacia). "Procedimientos" ya no es una tab: es la lista fija de
// la izquierda (mismo esquema que .hqd-split en IntervencionDetalleModal,
// HistorialQuirurgico -- encargo explícito con esa captura de referencia).
const DETAIL_TABS = [
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
  { id: 'personal', label: 'Personal clínico' },
  { id: 'equipos', label: 'Equipos' },
];

// Modal centrado superpuesto (nunca docked en el layout) -- mismo patrón
// que el resto de modales de esta feature (.modal-overlay/.modal-card, ver
// shared/shared.css). Antes era un drawer deslizante de 420px: se angostaba
// demasiado para 6 tabs + el bloque de datos del paciente (encargo
// explícito). `onClose` deselecciona y cierra el modal.
export default function DetalleCirugiaPanel({
  cirugia, onClose, onEditar, onReprogramar, onCancelar,
  onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('insumos');
  // Menú "Más acciones" (Marcar como programada/incumplida, Ver
  // información/historial) -- vivía en el panel lateral (AccionesBar, ver
  // MiniCalendarCirugias.jsx antes de este encargo) y se movió acá porque
  // ya depende de una cirugía seleccionada igual que el resto de este
  // modal. Abre hacia arriba (`.dcp-more-dropdown`) por estar pegado al
  // borde inferior de `.dcp-actions` -- mismo patrón autocontenido de
  // click-afuera/Escape que tenía AccionesBar.
  const [masOpen, setMasOpen] = useState(false);
  const masRef = useRef(null);

  useEffect(() => {
    if (!masOpen) return undefined;
    function handleClickOutside(e) {
      if (masRef.current && !masRef.current.contains(e.target)) setMasOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [masOpen]);
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
    setSelectedProcedimientoId(cirugia?.procedimientos[0]?.nombre ?? null);
  }

  useEffect(() => {
    if (!cirugia) return undefined;
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (masOpen) setMasOpen(false);
      else onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cirugia, masOpen, onClose]);

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

  const puedeAccionar = !ESTADOS_TERMINALES.includes(cirugia.estado);
  const puedeMarcarProgramada = cirugia.estado === 'urgencia';
  const puedeMarcarIncumplida = cirugia.estado === 'programada';

  const body = (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        onClose={onClose}
        closeLabel="Cerrar detalle"
      />
      <div className="dcp-status-row">
        <EstadoCirugiaBadge estado={cirugia.estado} />
      </div>

      {/* Mismos campos y orden que "Información del Procedimiento
          Quirúrgico" (formulario legacy de referencia, encargo explícito):
          No. Prog, Fecha, Tel. Aviso, Doc. Id, Nombre, Sexo, Edad, Nivel,
          Tipo Afiliado, Dirección, Aseguradora, Cirujano -- 12 campos que
          calzan exacto en una grilla de 3 columnas x 4 filas (antes 1 sola
          columna apilada porque el drawer de 420px no daba para más; el
          modal centrado sí tiene el ancho para repartirlos). */}
      <div className="dcp-info-grid">
        <div className="dcp-info-item">
          <div className="dcp-info-label">Nombre</div>
          <div className="dcp-info-value">{cirugia.paciente.nombre}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Doc. Id</div>
          <div className="dcp-info-value">{cirugia.paciente.documento}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Edad</div>
          <div className="dcp-info-value">{edadDetalleLabel(cirugia.paciente)}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Sexo</div>
          <div className="dcp-info-value">{cirugia.paciente.sexo}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Aseguradora</div>
          <div className="dcp-info-value">{cirugia.paciente.aseguradora}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Tel. Aviso</div>
          <div className="dcp-info-value">{cirugia.paciente.telAviso || '—'}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Nivel</div>
          <div className="dcp-info-value">{cirugia.paciente.nivel || '—'}</div>
        </div>
        <div className="dcp-info-item">
          <div className="dcp-info-label">Tipo Afiliado</div>
          <div className="dcp-info-value">{cirugia.paciente.tipoAfiliado || '—'}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">Dirección</div>
          <div className="dcp-info-value">{cirugia.paciente.direccion || '—'}</div>
        </div>

        <div className="dcp-info-item">
          <div className="dcp-info-label">No. Prog</div>
          <div className="dcp-info-value">{cirugia.id}</div>
        </div>
        <div className="dcp-info-item">
          <div className="dcp-info-label">Fecha</div>
          <div className="dcp-info-value">{fechaLabel(cirugia.fecha)} {cirugia.horaInicio}</div>
        </div>
        
                          
        <div className="dcp-info-item">
          <div className="dcp-info-label">Cirujano</div>
          <div className="dcp-info-value">{cirugia.cirujano || '—'}</div>
        </div>
      </div>

      {/* Split de 2 columnas -- mismo esquema que .hqd-split
          (IntervencionDetalleModal, HistorialQuirurgico, ver comentario en
          DetalleCirugiaPanel.css): izquierda, la lista fija de procedimientos
          de la cirugía; derecha, tabs anidadas Insumos/Farmacia/Personal
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
              {activeDetailTab === 'insumos' && <InsumosTab cirugia={cirugia} />}
              {activeDetailTab === 'farmacia' && <FarmaciaTab cirugia={cirugia} />}
              {activeDetailTab === 'personal' && <PersonalTab cirugia={cirugia} />}
              {activeDetailTab === 'equipos' && <EquiposTab cirugia={cirugia} />}
            </div>
          </section>
        </div>
      </div>

      <div className="dcp-actions">
        <div className="dcp-more-wrap" ref={masRef}>
          <Button variant="secondary" icon={LuChevronUp} onClick={() => setMasOpen((v) => !v)}>
            Más acciones
          </Button>
          {masOpen && (
            <div className="dcp-more-dropdown" role="menu">
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                disabled={!puedeMarcarProgramada}
                onClick={() => { setMasOpen(false); onMarcarProgramada(); }}
              >
                <LuCircleCheck className="icon" aria-hidden="true" />
                Marcar como programada
              </button>
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                disabled={!puedeMarcarIncumplida}
                onClick={() => { setMasOpen(false); onMarcarIncumplida(); }}
              >
                <LuCalendarClock className="icon" aria-hidden="true" />
                Marcar como incumplida
              </button>
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                onClick={() => { setMasOpen(false); onVerInfo(); }}
              >
                <LuInfo className="icon" aria-hidden="true" />
                Ver información/historial
              </button>
            </div>
          )}
        </div>

        <div className="dcp-actions-main">
          <Button variant="secondary" icon={LuPencil} disabled={!puedeAccionar} onClick={onEditar}>Editar</Button>
          <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
          <Button variant="danger" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>
        </div>
      </div>
    </>
  );

  return (
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
  );
}
