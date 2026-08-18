'use client';

import { useEffect, useRef, useState } from 'react';
import './Admisiones.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import { ESTADO_LABEL, fetchAdmisiones } from '@/hooks/Admisiones/mockAdmisionesData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import AdmisionesToolbar from '@/Components/Admisiones/AdmisionesToolbar/AdmisionesToolbar';
import AdmisionesTable from '@/Components/Admisiones/AdmisionesTable/AdmisionesTable';
import AdmisionesTableSkeleton from '@/Components/Admisiones/AdmisionesTableSkeleton/AdmisionesTableSkeleton';
import AdmisionesEmptyState from '@/Components/Admisiones/AdmisionesEmptyState/AdmisionesEmptyState';
import AdmisionDetalleModal from '@/Components/Admisiones/AdmisionDetalleModal/AdmisionDetalleModal';
import PreIngresoModal from '@/Components/Admisiones/PreIngresoModal/PreIngresoModal';
import { LuPlus, LuUserPlus } from 'react-icons/lu';

export default function Admisiones() {
  const [searchField, setSearchField] = useState('numeroAdmision');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [estado, setEstado] = useState('admitido');

  const [status, setStatus] = useState('loading'); // loading | ready
  const [admisiones, setAdmisiones] = useState([]);
  const [selectedAdmision, setSelectedAdmision] = useState(null);
  const [preIngresoPatient, setPreIngresoPatient] = useState(null);

  // Toast local (mismo texto/temporizador que .pc-toast en ProgramarCita)
  // para las acciones propias de esta pantalla (Editar, Nueva, altas...).
  // El modal de búsqueda/alta de pacientes (ver más abajo) trae su propio
  // window.ncToast — ambos coexisten sin pisarse, cada uno con su propio
  // elemento en pantalla.
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  // Mismo flujo compartido de búsqueda/alta de pacientes que Asignación de
  // citas/Programar cita/Lista de pacientes (.ps-overlay/.ap-overlay, ver
  // NuevaCitaFlow.jsx y AGENTS.md) — es el modal general de "buscar o
  // registrar un paciente" del proyecto, reutilizado tal cual acá en vez de
  // reimplementarlo, porque en un pre ingreso hospitalario el paciente puede
  // no estar registrado todavía (de ahí que "Agregar paciente" siga siendo
  // parte del mismo modal). `onPatientConfirmed` es lo que separa este uso
  // del de citas: normalmente elegir/crear un paciente encadena directo al
  // wizard de agendamiento (ncOpen) — acá en cambio continúa el pre ingreso,
  // ver handlePatientConfirmed.
  const preIngresoPatientRef = useRef(null);
  function handlePatientConfirmed(patient) {
    setPreIngresoPatient(patient);
  }
  function handlePreIngresoSubmit() {
    showToast(`Pre ingreso de ${preIngresoPatient?.nombre} registrado (en desarrollo).`);
    setPreIngresoPatient(null);
  }

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => preIngresoPatientRef.current,
      setPatient: (patient) => { preIngresoPatientRef.current = patient; },
      onPatientConfirmed: handlePatientConfirmed,
      clearPatientAfterConfirm: true,
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
  }, []);

  // Búsqueda con debounce de ~300ms, mismo criterio que ListaPacientes.jsx
  // (ver AGENTS.md / react-hooks/set-state-in-effect): "loading" solo se
  // marca dentro del callback del setTimeout (asíncrono) o desde manejadores
  // de evento (handleChangeSearchField/handleChangeEstado abajo) — nunca de
  // forma síncrona en el cuerpo de un efecto.
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('loading');
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchAdmisiones({ query: debouncedQuery, searchField, estado }).then(({ items }) => {
      if (cancelled) return;
      setAdmisiones(items);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [debouncedQuery, searchField, estado]);

  function handleChangeSearchField(value) {
    setStatus('loading');
    setSearchField(value);
  }
  function handleChangeEstado(value) {
    setStatus('loading');
    setEstado(value);
  }

  function handleEditar(admision) {
    showToast(`Editar admisión de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleRegistrarTriage(admision) {
    showToast(`Registrar triage de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleAltaMedica(admision) {
    showToast(`Alta médica de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleAltaAdministrativa(admision) {
    showToast(`Alta administrativa de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleVerHistoria(admision) {
    showToast(`Historia clínica de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleNueva() {
    showToast('Nueva admisión (en desarrollo).');
  }
  // Mismo primer paso que "Nueva cita" en Asignación de citas/Programar
  // cita: el pre ingreso arranca en el buscador de pacientes compartido (ver
  // initNuevaCita/handlePatientConfirmed más arriba) en vez de un formulario
  // propio.
  function handlePreIngreso() {
    window.openPatientSearch();
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Admisiones"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="adm-page-header">
            <div>
              <h1>Admisiones</h1>
              <p>Registra y gestiona los ingresos hospitalarios{estado !== 'todos' ? ` · ${ESTADO_LABEL[estado] ?? 'Todos'}` : ''}.</p>
            </div>
            <div className="adm-page-header-actions">
              <button type="button" className="btn btn-primary" onClick={handleNueva}>
                <LuPlus className="icon" />Nueva admisión
              </button>
              <button type="button" className="btn btn-primary" onClick={handlePreIngreso}>
                <LuUserPlus className="icon" />Pre ingreso
              </button>
            </div>
          </div>

          <div className="adm-card-shell">
            <AdmisionesToolbar
              searchField={searchField}
              onChangeSearchField={handleChangeSearchField}
              query={query}
              onChangeQuery={setQuery}
              estado={estado}
              onChangeEstado={handleChangeEstado}
            />

            {status === 'loading' && <AdmisionesTableSkeleton />}

            {status === 'ready' && admisiones.length === 0 && (
              <AdmisionesEmptyState
                subtitle={debouncedQuery ? 'Prueba con otro término de búsqueda o cambia el filtro de estado.' : undefined}
              />
            )}

            {status === 'ready' && admisiones.length > 0 && (
              <AdmisionesTable
                admisiones={admisiones}
                onEditar={handleEditar}
                onDetalle={setSelectedAdmision}
                onRegistrarTriage={handleRegistrarTriage}
                onAltaMedica={handleAltaMedica}
                onAltaAdministrativa={handleAltaAdministrativa}
                onVerHistoria={handleVerHistoria}
              />
            )}
          </div>
        </div>
      </div>

      <AdmisionDetalleModal admision={selectedAdmision} onClose={() => setSelectedAdmision(null)} />
      {preIngresoPatient && (
        <PreIngresoModal
          patient={preIngresoPatient}
          onClose={() => setPreIngresoPatient(null)}
          onSubmit={handlePreIngresoSubmit}
        />
      )}
      <NuevaCitaFlow />

      <div className={`adm-toast${toast ? ' show' : ''}`}>
        <span className="adm-toast-dot"></span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
