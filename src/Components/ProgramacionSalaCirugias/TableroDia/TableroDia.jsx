'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuCalendarDays } from 'react-icons/lu';
// Tokens (:root), reset del shell y reglas compartidas de la feature: los
// mismos 2 archivos que carga CanastasCirugia.jsx, porque esta ruta es otra
// página de la misma feature (ProgramacionSalaCirugias).
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './TableroDia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
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

// "Tablero de cirugías del día" (coordinación): una columna por sala de la
// sede con las cirugías del día en orden horario, KPIs arriba y las acciones
// de la agenda (reprogramar, cancelar, marcar realizada/incumplida) desde el
// "⋯" de cada tarjeta. Editar no se ofrece acá: pasa por el wizard de la
// agenda. Spec: docs/superpowers/specs/2026-10-02-tablero-cirugias-dia-design.md
export default function TableroDia() {
  const router = useRouter();
  const [sedeId, setSedeId] = useState('02');
  const [fecha, setFecha] = useState(() => fechaISO(new Date()));
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [selectedId, setSelectedId] = useState(null);

  const salasSede = SALAS.filter((s) => s.sedeId === sedeId);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

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
  }

  const {
    modal, setModal, toast,
    handleSubmitReprogramar, handleSubmitCancelar,
    handleReprogramarCirugia, handleCancelarCirugia,
    handleMarcarRealizada, handleMarcarIncumplida,
    handlePedirInsumos, handleCancelarSolicitud,
  } = useCirugiasAcciones({ applyUpdated });

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
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
          page="Tablero de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content td-content">
          <div className="psc-page-header">
            <div>
              <h1>Tablero de cirugías</h1>
              <p>Supervisa las cirugías del día por sala y atiende las que requieren acción.</p>
            </div>
            <div className="psc-page-header-actions">
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
              <Button variant="secondary-accent" icon={LuCalendarDays} onClick={() => router.push('/cirugia/programacion')}>
                Ver agenda
              </Button>
            </div>
          </div>

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
    </div>
  );
}
