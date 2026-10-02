'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuLayoutDashboard } from 'react-icons/lu';
import './TableroDia.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CanastasFechaNav from '../canastas/CanastasFechaNav/CanastasFechaNav';
import DetalleCirugiaPanel from '../DetalleCirugiaPanel/DetalleCirugiaPanel';
import ReprogramarCirugiaModal from '../modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from '../modals/CancelarCirugiaModal/CancelarCirugiaModal';
import TableroKpis from './TableroKpis/TableroKpis';
import ColumnaSala from './ColumnaSala/ColumnaSala';
import {
  SALAS, SEDES, ahoraDemo, fechaISO, fetchAgendaRango,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { canastasHref } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { agruparPorSala, kpisDelDia } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';
import useCirugiasAcciones from '@/hooks/ProgramacionSalaCirugias/useCirugiasAcciones';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';

// "Tablero del día" (coordinación), en un modal grande (90% de alto y ancho)
// que abre el Panel general: una columna por sala de la sede con las cirugías
// del día en orden horario, KPIs arriba y las acciones de la agenda
// (reprogramar, cancelar, marcar realizada/incumplida) desde el "⋯" de cada
// tarjeta. Editar no se ofrece acá: pasa por el wizard de Programación.
// `onCirugiaActualizada` avisa al Panel general de cada cambio para que su
// tabla quede al día sin re-fetch.
export default function TableroDia({ onClose, onCirugiaActualizada }) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [sedeId, setSedeId] = useState('02');
  const [fecha, setFecha] = useState(() => fechaISO(new Date()));
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [selectedId, setSelectedId] = useState(null);

  const salasSede = SALAS.filter((s) => s.sedeId === sedeId);

  // fetchAgendaRango filtra por una sola sala: se pide una por sala de la sede.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SALAS.filter((s) => s.sedeId === sedeId).map((s) => fetchAgendaRango({
        sedeId, salaId: s.value, inicio: fecha, fin: fecha,
      })),
    ).then((porSala) => {
      if (!cancelled) setCirugias(porSala.flat());
    });
    return () => { cancelled = true; };
  }, [sedeId, fecha]);

  // La respuesta de cada mutación ya trae el registro completo: se refleja en
  // la lista sin re-fetch (sale del tablero si cambió de día o de sede).
  function applyUpdated(actualizada) {
    setCirugias((prev) => {
      const lista = prev ?? [];
      if (actualizada.sedeId !== sedeId || actualizada.fecha !== fecha) {
        return lista.filter((c) => c.id !== actualizada.id);
      }
      return lista.some((c) => c.id === actualizada.id)
        ? lista.map((c) => (c.id === actualizada.id ? actualizada : c))
        : [...lista, actualizada];
    });
    onCirugiaActualizada?.(actualizada);
  }

  const {
    modal, setModal, toast,
    handleSubmitReprogramar, handleSubmitCancelar,
    handleReprogramarCirugia, handleCancelarCirugia,
    handleMarcarRealizada, handleMarcarIncumplida,
    handlePedirInsumos, handleCancelarSolicitud,
  } = useCirugiasAcciones({ applyUpdated });

  // Con el detalle o un modal de acción encima, el foco y Escape son de ese
  // diálogo, no de este.
  const subdialogoAbierto = selectedId !== null || modal !== null;
  useModalFocusTrap(cardRef, !subdialogoAbierto);
  useEffect(() => {
    if (subdialogoAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [subdialogoAbierto, onClose]);

  function handleSedeChange(v) {
    setSedeId(v);
    setCirugias(null);
    setSelectedId(null);
  }
  function handleFechaChange(v) {
    setFecha(v);
    setCirugias(null);
    setSelectedId(null);
  }

  // "Retrasada" solo aplica al día de hoy (la hora de demostración de la feature).
  const ahora = fecha === fechaISO(new Date()) ? ahoraDemo() : null;
  const lista = cirugias ?? [];
  const grupos = agruparPorSala(lista, salasSede);
  const kpis = kpisDelDia(lista, ahora);
  const selectedCirugia = lista.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <div className="modal-overlay open" role="presentation" onClick={onClose}>
        <div
          ref={cardRef}
          className="modal-card td-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="td-title"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader
            icon={LuLayoutDashboard}
            tone="primary"
            title="Tablero del día"
            titleId="td-title"
            subtitle="Supervisa las cirugías del día por sala y atiende las que requieren acción."
            onClose={onClose}
            closeLabel="Cerrar tablero"
            trailing={(
              <div className="td-controls">
                <div className="td-sede">
                  <FormSelect
                    id="td-sede"
                    ariaLabel="Sede"
                    value={sedeId}
                    onChange={handleSedeChange}
                    options={SEDES}
                  />
                </div>
                <CanastasFechaNav fecha={fecha} onFechaChange={handleFechaChange} />
              </div>
            )}
          />

          <div className="td-body">
            <div className="td-kpis">
              <TableroKpis kpis={kpis} />
            </div>

            {cirugias === null ? (
              <p className="td-estado" role="status">Cargando cirugías…</p>
            ) : (
              <div className="td-board">
                {grupos.map((grupo) => (
                  <ColumnaSala
                    key={grupo.sala.value}
                    grupo={grupo}
                    ahora={ahora}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onReprogramar={handleReprogramarCirugia}
                    onMarcarRealizada={handleMarcarRealizada}
                    onMarcarIncumplida={handleMarcarIncumplida}
                    onCancelar={handleCancelarCirugia}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DetalleCirugiaPanel
        cirugia={selectedCirugia}
        onClose={() => setSelectedId(null)}
        onReprogramar={handleReprogramarCirugia}
        onCancelar={handleCancelarCirugia}
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onPedirInsumos={handlePedirInsumos}
        onCancelarSolicitud={handleCancelarSolicitud}
        onVerEnCanastas={(cirugia) => router.push(canastasHref(cirugia))}
      />

      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </>
  );
}
