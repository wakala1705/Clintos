'use client';

import { useEffect, useState } from 'react';
import './DetalleCirugiaPanel.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import ProcedimientosSideList from './ProcedimientosSideList/ProcedimientosSideList';
import DetalleRealizada from './DetalleRealizada/DetalleRealizada';
import { obtenerHojaConsumo } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import CancelarSolicitudInsumosModal from '../modals/CancelarSolicitudInsumosModal/CancelarSolicitudInsumosModal';
import HojaConsumoAltModal from '../modals/HojaConsumoAltModal/HojaConsumoAltModal';
import VincularCanastaModal from '../modals/VincularCanastaModal/VincularCanastaModal';
import VincularPersonalModal from '../modals/VincularPersonalModal/VincularPersonalModal';
import VincularEquiposModal from '../modals/VincularEquiposModal/VincularEquiposModal';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { capitalizarNombre, inicialesPaciente } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  ESTADOS_TERMINALES_CIRUGIA, edadDetalleLabel, estaIniciada, fechaHoraRangoLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuBan, LuCalendarClock, LuChevronDown, LuPencil,
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
  onPedirInsumos, onVincularCanasta,
  onVincularPersonal, onVincularEquipos, onActualizarPersonal, onActualizarEquipos,
  onCancelarSolicitud, onVerEnCanastas, onConsumoRegistrado, onFinalizarCirugia,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('insumos');
  // Datos que se consultan poco (orden y admisión de la programación; contacto del paciente) van plegados
  // detrás de un solo "Ver más datos" para que la franja de arriba no le quite espacio a lo importante.
  const [datosExpandidos, setDatosExpandidos] = useState(false);
  // "Ahora" tomado al montar (render puro): decide si la cirugía ya pasó de hora.
  // Ventana "Causal de Cancelación de Programación" (se abre desde
  // "Cancelar solicitud" de la tab Insumos), también encima de este modal.
  const [cancelarSolicitudAbierto, setCancelarSolicitudAbierto] = useState(false);
  const [hojaGastoAltAbierta, setHojaGastoAltAbierta] = useState(false);
  // "Vincular canasta" (tab Insumos, cirugía programada sin canasta).
  const [vincularCanastaAbierto, setVincularCanastaAbierto] = useState(false);
  // "Vincular personal" / "Vincular equipos" (tabs Personal clínico y Equipos, cirugía sin nada vinculado).
  const [vincularPersonalAbierto, setVincularPersonalAbierto] = useState(false);
  const [vincularEquiposAbierto, setVincularEquiposAbierto] = useState(false);
  // Hoja de consumo guardada de la cirugía: vive en un almacén fuera de React, así que se
  // relee en eventos (al cambiar de cirugía y al cerrar su modal), no en el render.
  const [hoja, setHoja] = useState(() => (cirugia ? obtenerHojaConsumo(cirugia.id) : null));
  const subventanaAbierta = cancelarSolicitudAbierto || hojaGastoAltAbierta || vincularCanastaAbierto
    || vincularPersonalAbierto || vincularEquiposAbierto;
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
    setDatosExpandidos(false);
    setCancelarSolicitudAbierto(false);
    setHojaGastoAltAbierta(false);
    setVincularPersonalAbierto(false);
    setVincularEquiposAbierto(false);
    setHoja(cirugia ? obtenerHojaConsumo(cirugia.id) : null);
    setSelectedProcedimientoId(cirugia?.procedimientos[0]?.nombre ?? null);
  }

  useEffect(() => {
    // Con una subventana abierta encima (Devoluciones / Cancelar solicitud),
    // Escape cierra solo esa ventana (su propio listener), no el detalle.
    if (!cirugia || subventanaAbierta) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cirugia, onClose, subventanaAbierta]);

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

  // En curso (iniciada) o en estado terminal ya no se edita, reprograma ni cancela.
  const puedeAccionar = !ESTADOS_TERMINALES_CIRUGIA.includes(cirugia.estado) && !estaIniciada(cirugia);

  const bodyAbierta = (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        onClose={onClose}
        closeLabel="Cerrar detalle"
        titleAdornment={<EstadoCirugiaBadge estado={cirugia.estado} />}
      />

      {/* Mismos 12 campos del formulario legacy de referencia, agrupados en
          2 bloques: Programación (lo que identifica la cirugía, destacado,
          con el estado como un campo más de su grilla) y Paciente (datos de contexto). */}
      <div className="dcp-info">
        <section className="dcp-info-group dcp-info-group-pac" aria-label="Paciente">
          <div className="dcp-info-grid">
            <div className="dcp-info-item">
              <div className="dcp-paciente-nombre">
                <PatientAvatar iniciales={inicialesPaciente(cirugia.paciente.nombre)} className="dcp-avatar" />
                <div className="dcp-paciente-texto">
                  <div className="dcp-info-value">{cirugia.paciente.nombre.toUpperCase()}</div>
                  <div className="dcp-paciente-doc">{cirugia.paciente.documento}</div>
                </div>
              </div>
            </div>
            <InfoItem label="Edad" value={edadDetalleLabel(cirugia.paciente)} />
            {cirugia.paciente.sexo && <InfoItem label="Sexo" value={cirugia.paciente.sexo} />}
            <InfoItem label="Aseguradora" value={cirugia.paciente.aseguradora} />
            {cirugia.paciente.telAviso && <InfoItem label="Tel. Aviso" value={cirugia.paciente.telAviso} />}
            {datosExpandidos && (
              <>
                {cirugia.paciente.nivel && <InfoItem label="Nivel" value={cirugia.paciente.nivel} />}
                {cirugia.paciente.tipoAfiliado && <InfoItem label="Tipo Afiliado" value={cirugia.paciente.tipoAfiliado} />}
                {cirugia.paciente.direccion && <InfoItem label="Dirección" value={cirugia.paciente.direccion} wide />}
              </>
            )}
          </div>
          <button
            type="button"
            className="dcp-info-chevron"
            aria-expanded={datosExpandidos}
            aria-label={datosExpandidos ? 'Ver menos datos de la programación y del paciente' : 'Ver más datos de la programación y del paciente'}
            title={datosExpandidos ? 'Ver menos datos' : 'Ver más datos'}
            onClick={() => setDatosExpandidos((v) => !v)}
          >
            <LuChevronDown className={`dcp-info-toggle-icon${datosExpandidos ? ' open' : ''}`} aria-hidden="true" />
          </button>
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
            {/* Programación va arriba de la lista de procedimientos, dentro del mismo bloque. */}
            <div className="dcp-info-group dcp-info-group-prog" aria-label="Programación">
              <div className="dcp-info-group-title">
                <LuCalendarClock className="dcp-info-group-icon" aria-hidden="true" />
                Programación
                <span className="dcp-prog-fecha">{fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}</span>
              </div>
              {/* Sala, Cirujano y Admisión no se muestran (encargo explícito): el cirujano
                  aún no se conoce al programar, y la sala y la admisión no aportan aquí. */}
              {datosExpandidos && cirugia.solicitud && (
                <div className="dcp-info-grid">
                  <InfoItem
                    label={`Orden · ${ORIGEN_LABEL[cirugia.solicitud.origen]}`}
                    value={`${cirugia.solicitud.ordenNumero} · ${capitalizarNombre(cirugia.solicitud.medicoOrdena)}`}
                    wide
                  />
                </div>
              )}
            </div>
            <div className="dcp-split-left-body">
              <ProcedimientosSideList
                procedimientos={cirugia.procedimientos}
                selectedId={selectedProcedimientoId}
                onSelect={setSelectedProcedimientoId}
              />
            </div>
            {/* Editar, Reprogramar y Cancelar como pie del bloque (mismas reglas de
                disabled que CirugiaCardMenu.jsx).
                La acción principal ("Pedir insumos a farmacia") vive en el pie de la
                tabla de Insumos (ver InsumosTab.jsx). */}
            <div className="dcp-split-left-footer">
              <Button variant="secondary-danger" icon={LuBan} disabled={!puedeAccionar} onClick={() => onCancelar(cirugia)}>Cancelar cirugía</Button>
              <Button variant="secondary-accent" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={() => onReprogramar(cirugia)}>Reprogramar</Button>
              {onEditar && <Button variant="secondary-accent" icon={LuPencil} disabled={!puedeAccionar} onClick={() => onEditar(cirugia)}>Editar</Button>}
            </div>
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
                  onVincularCanasta={() => setVincularCanastaAbierto(true)}
                  onCancelarSolicitud={() => setCancelarSolicitudAbierto(true)}
                  onVerEnCanastas={onVerEnCanastas}
                />
              )}
              {activeDetailTab === 'personal' && (
                <PersonalTab
                  cirugia={cirugia}
                  puedeAccionar={puedeAccionar}
                  onVincular={() => setVincularPersonalAbierto(true)}
                />
              )}
              {activeDetailTab === 'equipos' && (
                <EquiposTab
                  cirugia={cirugia}
                  puedeAccionar={puedeAccionar}
                  onVincular={() => setVincularEquiposAbierto(true)}
                />
              )}
            </div>
          </section>
        </div>
      </div>

    </>
  );

  // Una cirugía realizada ya no se prepara ni se reprograma: se muestra su resultado y
  // su cierre (ver DetalleRealizada.jsx) en el mismo modal, a 90% de ancho y alto.
  const esRealizada = cirugia.estado === 'realizada';
  const body = esRealizada ? (
    <DetalleRealizada
      cirugia={cirugia}
      hoja={hoja}
      onClose={onClose}
      onVerEnCanastas={onVerEnCanastas}
      onAbrirHoja={() => setHojaGastoAltAbierta(true)}
    />
  ) : bodyAbierta;

  return (
    <>
      <div className="modal-overlay open" role="presentation" onClick={onClose}>
        <div
          className={`modal-card dcp-modal-card${esRealizada ? ' dcp-modal-realizada' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dcp-title"
          onClick={(e) => e.stopPropagation()}
        >
          {body}
        </div>
      </div>
      {cancelarSolicitudAbierto && (
        <CancelarSolicitudInsumosModal
          onSubmit={(datos) => {
            onCancelarSolicitud(cirugia, datos);
            setCancelarSolicitudAbierto(false);
          }}
          onClose={() => setCancelarSolicitudAbierto(false)}
        />
      )}
      {vincularCanastaAbierto && (
        <VincularCanastaModal
          complejidadSugerida={cirugia.complejidad || null}
          procedimientosSugeridos={cirugia.procedimientos.map((p) => p.nombre)}
          onSelect={(canasta) => onVincularCanasta(cirugia, canasta)}
          onClose={() => setVincularCanastaAbierto(false)}
        />
      )}
      {vincularPersonalAbierto && (
        <VincularPersonalModal
          inicial={cirugia.personal.length > 0 ? cirugia.personal : undefined}
          onConfirmar={(personal) => (cirugia.personal.length > 0 ? onActualizarPersonal : onVincularPersonal)(cirugia, personal)}
          onClose={() => setVincularPersonalAbierto(false)}
        />
      )}
      {vincularEquiposAbierto && (
        <VincularEquiposModal
          inicial={cirugia.equipos.length > 0 ? cirugia.equipos : undefined}
          onConfirmar={(equipos) => (cirugia.equipos.length > 0 ? onActualizarEquipos : onVincularEquipos)(cirugia, equipos)}
          onClose={() => setVincularEquiposAbierto(false)}
        />
      )}
      {hojaGastoAltAbierta && (
        <HojaConsumoAltModal
          cirugia={cirugia}
          onConsumoRegistrado={onConsumoRegistrado}
          onFinalizar={onFinalizarCirugia}
          onVerEnCanastas={onVerEnCanastas}
          onClose={() => {
            setHojaGastoAltAbierta(false);
            setHoja(obtenerHojaConsumo(cirugia.id));
          }}
        />
      )}
    </>
  );
}
