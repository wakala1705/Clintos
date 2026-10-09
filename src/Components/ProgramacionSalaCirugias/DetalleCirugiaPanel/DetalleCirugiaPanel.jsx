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
import {
  ESTADOS_TERMINALES_CIRUGIA, SALAS, ahoraDemo, cirugiaYaInicio, edadDetalleLabel, estaIniciada, fechaHoraRangoLabel, resumenCanasta, CANASTA_ESTADOS_RECIBIDOS,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuBan, LuCalendarClock, LuCalendarX, LuCheckCheck, LuChevronDown, LuPencil, LuUser,
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
  onMarcarRealizada, onMarcarIncumplida, onPedirInsumos, onVincularCanasta,
  onCancelarSolicitud, onVerEnCanastas, onConsumoRegistrado, onFinalizarCirugia,
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('insumos');
  // Datos de contacto del paciente (tel., nivel, tipo de afiliado, dirección): se consultan poco, van plegados.
  const [pacienteExpandido, setPacienteExpandido] = useState(false);
  // "Ahora" tomado al montar (render puro): decide si la cirugía ya pasó de hora.
  const [ahora] = useState(() => ahoraDemo());
  // Ventana "Causal de Cancelación de Programación" (se abre desde
  // "Cancelar solicitud" de la tab Insumos), también encima de este modal.
  const [cancelarSolicitudAbierto, setCancelarSolicitudAbierto] = useState(false);
  const [hojaGastoAltAbierta, setHojaGastoAltAbierta] = useState(false);
  // "Vincular canasta" (tab Insumos, cirugía programada sin canasta).
  const [vincularCanastaAbierto, setVincularCanastaAbierto] = useState(false);
  // Hoja de consumo guardada de la cirugía: vive en un almacén fuera de React, así que se
  // relee en eventos (al cambiar de cirugía y al cerrar su modal), no en el render.
  const [hoja, setHoja] = useState(() => (cirugia ? obtenerHojaConsumo(cirugia.id) : null));
  const subventanaAbierta = cancelarSolicitudAbierto || hojaGastoAltAbierta || vincularCanastaAbierto;
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
    setPacienteExpandido(false);
    setCancelarSolicitudAbierto(false);
    setHojaGastoAltAbierta(false);
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

  const puedeMarcarRealizada = !ESTADOS_TERMINALES_CIRUGIA.includes(cirugia.estado);
  // En curso (iniciada) ya no se edita, reprograma, cancela ni incumple: solo se cierra.
  const puedeAccionar = puedeMarcarRealizada && !estaIniciada(cirugia);
  // Incumplida solo aplica cuando la hora de inicio ya pasó.
  const puedeMarcarIncumplida = puedeAccionar && cirugia.estado === 'programada' && cirugiaYaInicio(cirugia, ahora);
  // Una cirugía programada solo se cierra como realizada cuando ya empezó (igual que incumplida);
  // una urgencia se resuelve en el momento.
  // Una sola acción principal por vista, la que sigue en el flujo: pedir insumos -> recibir la
  // canasta (Ver en Canastas, en la pestaña Insumos) -> marcar como realizada. Solo con la canasta
  // ya recibida y la cirugía en condiciones de cerrarse, "Marcar como realizada" es la azul.
  const realizadaEsPrincipal = puedeMarcarRealizada && CANASTA_ESTADOS_RECIBIDOS.includes(resumenCanasta(cirugia).estado);

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
        <section className="dcp-info-group dcp-info-group-prog" aria-label="Programación">
          <div className="dcp-info-group-title">
            <LuCalendarClock className="dcp-info-group-icon" aria-hidden="true" />
            Programación
            <span className="dcp-info-group-num" title="No. de programación">{cirugia.id}</span>
          </div>
          <div className="dcp-info-grid">
            <InfoItem label="Fecha" value={fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)} wide />
            <InfoItem label="Sala" value={SALAS.find((s) => s.value === cirugia.salaId)?.descripcion ?? '—'} />
            <InfoItem label="Cirujano" value={cirugia.cirujano || '—'} />
            {cirugia.solicitud && (
              <>
                <InfoItem
                  label={`Orden · ${ORIGEN_LABEL[cirugia.solicitud.origen]}`}
                  value={`${cirugia.solicitud.ordenNumero} · ${cirugia.solicitud.medicoOrdena}`}
                  wide
                />
                <InfoItem
                  label="Admisión"
                  value={cirugia.solicitud.ambulatorio ? 'Creada con la programación' : 'Internación (admisión existente)'}
                  wide
                />
              </>
            )}
          </div>
        </section>
        <section className="dcp-info-group dcp-info-group-pac" aria-label="Paciente">
          <div className="dcp-info-group-title">
            <LuUser className="dcp-info-group-icon" aria-hidden="true" />
            Paciente
            <button
              type="button"
              className="dcp-info-toggle"
              aria-expanded={pacienteExpandido}
              onClick={() => setPacienteExpandido((v) => !v)}
            >
              {pacienteExpandido ? 'Ver menos' : 'Ver más datos'}
              <LuChevronDown className={`dcp-info-toggle-icon${pacienteExpandido ? ' open' : ''}`} aria-hidden="true" />
            </button>
          </div>
          <div className="dcp-info-grid">
            <InfoItem label="Nombre" value={cirugia.paciente.nombre} />
            <InfoItem label="Doc. Id" value={cirugia.paciente.documento} />
            <InfoItem label="Edad" value={edadDetalleLabel(cirugia.paciente)} />
            <InfoItem label="Sexo" value={cirugia.paciente.sexo} />
            <InfoItem label="Aseguradora" value={cirugia.paciente.aseguradora} />
            {pacienteExpandido && (
              <>
                <InfoItem label="Tel. Aviso" value={cirugia.paciente.telAviso || '—'} />
                <InfoItem label="Nivel" value={cirugia.paciente.nivel || '—'} />
                <InfoItem label="Tipo Afiliado" value={cirugia.paciente.tipoAfiliado || '—'} />
                <InfoItem label="Dirección" value={cirugia.paciente.direccion || '—'} wide />
              </>
            )}
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
                  onVincularCanasta={() => setVincularCanastaAbierto(true)}
                  onCancelarSolicitud={() => setCancelarSolicitudAbierto(true)}
                  onVerEnCanastas={onVerEnCanastas}
                />
              )}
              {activeDetailTab === 'personal' && <PersonalTab cirugia={cirugia} />}
              {activeDetailTab === 'equipos' && <EquiposTab cirugia={cirugia} />}
            </div>
          </section>
        </div>
      </div>

      {/* Cancelar cirugía (destructiva) aislada en el extremo izquierdo, neutra en
          reposo y roja solo en hover; a la derecha, modificar (Editar/Reprogramar)
          y resolver (incumplida/realizada) --
          mismas reglas de disabled que CirugiaCardMenu.jsx. La acción
          principal ("Pedir insumos a farmacia") vive en el pie de la tabla
          de Insumos (ver InsumosTab.jsx). */}
      <div className="dcp-actions">
        <Button variant="secondary-accent" icon={LuBan} className="dcp-cancelar-btn" disabled={!puedeAccionar} onClick={() => onCancelar(cirugia)}>Cancelar cirugía</Button>
        <div className="dcp-actions-estado">
          {onEditar && <Button variant="secondary-accent" icon={LuPencil} disabled={!puedeAccionar} onClick={() => onEditar(cirugia)}>Editar</Button>}
          <Button variant="secondary-accent" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={() => onReprogramar(cirugia)}>Reprogramar</Button>
          <Button variant="secondary-accent" icon={LuCalendarX} disabled={!puedeMarcarIncumplida} title={puedeMarcarIncumplida ? undefined : 'Disponible cuando pase la hora de inicio'} onClick={() => onMarcarIncumplida(cirugia)}>Marcar como incumplida</Button>
          <Button variant={realizadaEsPrincipal ? 'primary' : 'secondary-accent'} icon={LuCheckCheck} disabled={!puedeMarcarRealizada} onClick={() => onMarcarRealizada(cirugia)}>Marcar como realizada</Button>
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
          onSelect={(canasta) => onVincularCanasta(cirugia, canasta)}
          onClose={() => setVincularCanastaAbierto(false)}
        />
      )}
      {hojaGastoAltAbierta && (
        <HojaConsumoAltModal
          cirugia={cirugia}
          onConsumoRegistrado={onConsumoRegistrado}
          onFinalizar={onFinalizarCirugia}
          onClose={() => {
            setHojaGastoAltAbierta(false);
            setHoja(obtenerHojaConsumo(cirugia.id));
          }}
        />
      )}
    </>
  );
}
