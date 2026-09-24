'use client';

import { useEffect, useRef, useState } from 'react';
import './PacientesEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
// Scaffolding del modal de detalle (.adm-modal-*), que vive en el shared de
// Admisiones — solo trae clases con prefijo adm-, no choca con este feature.
import '@/Components/Admisiones/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { ADMISIONES_PISO, fetchPacientesPiso } from '@/hooks/GestionEnfermeria/mockPacientesEnfermeriaData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionEnfermeriaSidebar from '@/Components/GestionEnfermeria/GestionEnfermeriaSidebar/GestionEnfermeriaSidebar';
import AdmisionesToolbar from '@/Components/Admisiones/AdmisionesToolbar/AdmisionesToolbar';
import AdmisionesTable from '@/Components/Admisiones/AdmisionesTable/AdmisionesTable';
import AdmisionesTableSkeleton from '@/Components/Admisiones/AdmisionesTableSkeleton/AdmisionesTableSkeleton';
import AdmisionesEmptyState from '@/Components/Admisiones/AdmisionesEmptyState/AdmisionesEmptyState';
import ListFooter from '@/Components/ListFooter/ListFooter';
import DetalleAdmisionModal from '@/Components/DetalleAdmisionModal/DetalleAdmisionModal';
import { getDetalleAdmision } from '@/hooks/HistoriaClinicaHospitalizacion/mockHospitalizadosData';

// Sección "Pacientes" de Gestión de Enfermería — replica la tabla de
// Admisiones (encargo explícito: "la misma tabla"), reutilizando sus mismos
// componentes en vez de copiarlos, con los 14 pacientes del piso (ver
// mockPacientesEnfermeriaData.js). Búsqueda con debounce y filtro de estado
// se manejan igual que en Admisiones.jsx.
//
// Columnas que no aplican en piso (ver `ocultarColumnas` en
// AdmisionesTable.jsx): el skeleton usa el mismo número de columnas para que
// nada salte al terminar de cargar.
const COLUMNAS_OCULTAS = ['estado', 'atendido', 'tipoContrato'];
const COLUMNAS_TABLA = 14 - COLUMNAS_OCULTAS.length;
export default function PacientesEnfermeria() {
  const [searchField, setSearchField] = useState('numeroAdmision');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [estado, setEstado] = useState('admitido');
  const [status, setStatus] = useState('loading'); // loading | ready
  const [pacientes, setPacientes] = useState([]);
  const [selectedAdmision, setSelectedAdmision] = useState(null);
  // Footer: hora de la última respuesta de fetchPacientesPiso. "Actualizar"
  // vuelve a pedir la lista (`recarga` entra en las deps del fetch).
  const [actualizadoEn, setActualizadoEn] = useState(() => new Date());
  const [recarga, setRecarga] = useState(0);

  // Mismo toast local que Admisiones (.adm-toast) para las acciones que
  // siguen en desarrollo (Editar, megamenú de acciones).
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
    const t = setTimeout(() => {
      setStatus('loading');
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchPacientesPiso({ query: debouncedQuery, searchField, estado }).then(({ items }) => {
      if (cancelled) return;
      setPacientes(items);
      setActualizadoEn(new Date());
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [debouncedQuery, searchField, estado, recarga]);

  function handleChangeSearchField(value) {
    setStatus('loading');
    setSearchField(value);
  }
  function handleChangeEstado(value) {
    setStatus('loading');
    setEstado(value);
  }
  function handleActualizar() {
    setStatus('loading');
    setRecarga((n) => n + 1);
  }

  function handleEditar(admision) {
    showToast(`Editar admisión de ${admision.nombreAfiliado} (en desarrollo).`);
  }
  function handleAccion(admision, item) {
    if (item.id === 'atajos') {
      showToast('Atajos de la pantalla (en desarrollo).');
      return;
    }
    showToast(`${item.label} de ${admision.nombreAfiliado} (en desarrollo).`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
          page="Pacientes"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ge-shell-content">
          <GestionEnfermeriaSidebar />

          <div className="ge-page-body">
            <div className="pe-header">
              <h1>Pacientes</h1>
              <p>Listado y gestión detallada de los pacientes del área seleccionada.</p>
            </div>

            <div className="card">
              <AdmisionesToolbar
                searchField={searchField}
                onChangeSearchField={handleChangeSearchField}
                query={query}
                onChangeQuery={setQuery}
                estado={estado}
                onChangeEstado={handleChangeEstado}
              />

              {status === 'loading' && <AdmisionesTableSkeleton columns={COLUMNAS_TABLA} />}

              {status === 'ready' && pacientes.length === 0 && (
                <AdmisionesEmptyState
                  subtitle={debouncedQuery ? 'Prueba con otro término de búsqueda o cambia el filtro de estado.' : undefined}
                />
              )}

              {status === 'ready' && pacientes.length > 0 && (
                <AdmisionesTable
                  admisiones={pacientes}
                  onEditar={handleEditar}
                  onDetalle={setSelectedAdmision}
                  onAccion={handleAccion}
                  ocultarColumnas={COLUMNAS_OCULTAS}
                />
              )}

              {/* Total = pacientes del piso (sin búsqueda ni filtro de estado). */}
              <ListFooter
                mostrando={pacientes.length}
                total={ADMISIONES_PISO.length}
                actualizadoEn={actualizadoEn}
                onActualizar={handleActualizar}
                cargando={status === 'loading'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mismos pacientes del piso que HC Hospitalización: el detalle sale
          de getDetalleAdmision (con diagnóstico, estancia, edad...), no del
          registro reducido de la tabla de admisiones. */}
      {selectedAdmision && (
        <DetalleAdmisionModal detalle={getDetalleAdmision(selectedAdmision.id)} onClose={() => setSelectedAdmision(null)} />
      )}

      <div className={`pe-toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        <span className="pe-toast-dot"></span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
