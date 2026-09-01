'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import './ProgramacionSalaCirugias.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import FiltrosBar from './FiltrosBar/FiltrosBar';
import AccionesBar from './AccionesBar/AccionesBar';
import AgendaSemana from './AgendaSemana/AgendaSemana';
import DetalleCirugiaPanel from './DetalleCirugiaPanel/DetalleCirugiaPanel';
import NuevaCirugiaModal from './modals/NuevaCirugiaModal/NuevaCirugiaModal';
import ReprogramarCirugiaModal from './modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from './modals/CancelarCirugiaModal/CancelarCirugiaModal';
import {
  SALAS,
  SEMANA_ANCLA,
  actualizarCirugia,
  actualizarEstadoCirugia,
  addDias,
  cancelarCirugia,
  crearCirugia,
  diasDeSemana,
  fechaISO,
  fetchAgendaSemana,
  rangoSemanaLabel,
  reprogramarCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function ProgramacionSalaCirugias() {
  const [sedeId, setSedeId] = useState('02');
  const [salaId, setSalaId] = useState('qx-1');
  const [weekStart, setWeekStart] = useState(SEMANA_ANCLA);
  const [estado, setEstado] = useState('todos');

  const [cirugias, setCirugias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAgendaSemana({
      sedeId, salaId, weekStart, estado,
    }).then((items) => {
      if (cancelled) return;
      setCirugias(items);
    });
    return () => { cancelled = true; };
  }, [sedeId, salaId, weekStart, estado]);

  // Decide si una cirugía (recién creada/mutada) pertenece a la vista
  // actualmente visible -- evita un re-fetch completo después de cada
  // mutación: la respuesta de crearCirugia/actualizarCirugia/etc. ya trae
  // el registro completo, solo hace falta decidir si mostrarlo.
  function perteneceAVistaActual(c) {
    if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
    const inicio = fechaISO(weekStart);
    const fin = fechaISO(addDias(weekStart, 6));
    if (c.fecha < inicio || c.fecha > fin) return false;
    if (estado !== 'todos' && c.estado !== estado) return false;
    return true;
  }

  function applyUpdated(actualizada) {
    setCirugias((prev) => {
      if (!perteneceAVistaActual(actualizada)) return prev.filter((c) => c.id !== actualizada.id);
      const existe = prev.some((c) => c.id === actualizada.id);
      return existe ? prev.map((c) => (c.id === actualizada.id ? actualizada : c)) : [...prev, actualizada];
    });
  }

  function handleSedeChange(v) {
    setSedeId(v);
    setSalaId(SALAS.find((s) => s.sedeId === v)?.value ?? '');
    setSelectedId(null);
  }
  function handleSalaChange(v) {
    setSalaId(v);
    setSelectedId(null);
  }
  function handleWeekStartChange(d) {
    setWeekStart(d);
    setSelectedId(null);
  }
  function handleEstadoChange(v) {
    setEstado(v);
    setSelectedId(null);
  }
  function handleVistaNoDisponible() {
    showToast('Esta vista está en desarrollo.');
  }

  const selectedCirugia = cirugias.find((c) => c.id === selectedId) ?? null;
  const salaLabelActual = SALAS.find((s) => s.value === salaId)?.label ?? '';

  function handleSubmitCirugiaForm(datos) {
    // `datos` siempre trae la key `urgencia` (NuevaCirugiaModal la agrega
    // sin importar el modo, ver Task 10) -- crearCirugia la consume para
    // decidir el estado inicial, pero Cirugia no tiene un campo `urgencia`
    // propio, así que en modo edición se descarta explícitamente para no
    // dejarla pegada al registro vía el merge de actualizarCirugia.
    const { urgencia, ...datosCirugia } = datos;
    if (modal?.type === 'editar') {
      const actualizada = actualizarCirugia(modal?.cirugia?.id, datosCirugia);
      applyUpdated(actualizada);
      setSelectedId(actualizada.id);
      showToast('Cirugía actualizada correctamente.');
    } else {
      const nueva = crearCirugia({ ...datosCirugia, urgencia: modal?.type === 'urgencia' });
      applyUpdated(nueva);
      setSelectedId(nueva.id);
      showToast(modal?.type === 'urgencia' ? 'Cirugía de urgencia registrada.' : 'Cirugía creada correctamente.');
    }
    setModal(null);
  }

  function handleSubmitReprogramar(datos) {
    const actualizada = reprogramarCirugia(modal?.cirugia?.id, datos);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía reprogramada correctamente.');
  }

  function handleSubmitCancelar(motivo) {
    const actualizada = cancelarCirugia(modal?.cirugia?.id, motivo);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía cancelada correctamente.');
  }

  function handleMarcarProgramada() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'programada'));
    showToast('Cirugía marcada como programada.');
  }
  function handleMarcarIncumplida() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'incumplida'));
    showToast('Cirugía marcada como incumplida.');
  }
  // "Ver información/historial" solo tiene sentido con una cirugía
  // seleccionada (AccionesBar ya deshabilita el ítem del menú sin
  // selección) -- el panel de detalle ya está visible en ese momento, así
  // que no hay ninguna acción adicional que ejecutar en V1 (no existe un
  // historial de auditoría real en el mock, ver spec).
  function handleVerInfo() {}

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Programación sala de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Programación sala de cirugías</h1>
              <p>Agenda y gestiona la ocupación de las salas de cirugía.</p>
            </div>
          </div>

          <FiltrosBar
            sedeId={sedeId}
            onSedeChange={handleSedeChange}
            salaId={salaId}
            onSalaChange={handleSalaChange}
            weekStart={weekStart}
            onWeekStartChange={handleWeekStartChange}
            estado={estado}
            onEstadoChange={handleEstadoChange}
            onVistaNoDisponible={handleVistaNoDisponible}
          />

          <AccionesBar
            selected={selectedCirugia}
            onNuevaCirugia={() => setModal({ type: 'nueva' })}
            onNuevaUrgencia={() => setModal({ type: 'urgencia' })}
            onReprogramar={() => selectedCirugia && setModal({ type: 'reprogramar', cirugia: selectedCirugia })}
            onCancelar={() => selectedCirugia && setModal({ type: 'cancelar', cirugia: selectedCirugia })}
            onMarcarProgramada={handleMarcarProgramada}
            onMarcarIncumplida={handleMarcarIncumplida}
            onVerInfo={handleVerInfo}
          />

          <div className="psc-main-row">
            <AgendaSemana
              weekLabel={rangoSemanaLabel(weekStart)}
              days={diasDeSemana(weekStart)}
              cirugias={cirugias}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onPrevWeek={() => handleWeekStartChange(addDias(weekStart, -7))}
              onNextWeek={() => handleWeekStartChange(addDias(weekStart, 7))}
            />
            <DetalleCirugiaPanel
              cirugia={selectedCirugia}
              salaLabel={salaLabelActual}
              onClose={() => setSelectedId(null)}
              onEditar={() => selectedCirugia && setModal({ type: 'editar', cirugia: selectedCirugia })}
              onReprogramar={() => selectedCirugia && setModal({ type: 'reprogramar', cirugia: selectedCirugia })}
              onCancelar={() => selectedCirugia && setModal({ type: 'cancelar', cirugia: selectedCirugia })}
            />
          </div>
        </div>
      </div>

      {(modal?.type === 'nueva' || modal?.type === 'urgencia' || modal?.type === 'editar') && (
        <NuevaCirugiaModal
          sedeId={sedeId}
          urgencia={modal?.type === 'urgencia'}
          cirugiaExistente={modal?.type === 'editar' ? modal?.cirugia : null}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitCirugiaForm}
        />
      )}
      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`}>
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
