'use client';

import { useEffect, useMemo, useState } from 'react';
import './Vacunacion.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import VacKpiRow from './VacKpiRow/VacKpiRow';
import VacToolbar from './VacToolbar/VacToolbar';
import VacTable from './VacTable/VacTable';
import VacPagination from './VacPagination/VacPagination';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuListChecks, LuSyringe } from 'react-icons/lu';
import { ESTADO_URGENCIA, MOCK_PACIENTES, matchesProxima, normalize } from '@/hooks/Vacunacion/mockVacunacionData';
import EsquemaVacunacion from '@/Components/EsquemaVacunacion/EsquemaVacunacion';
import RegistrarVacunacionModal from './RegistrarVacunacionModal/RegistrarVacunacionModal';
import Button from '@/Components/Button/Button';

// Ruta /vacunacion — pantalla principal de PyMS (Promoción y Mantenimiento de
// la Salud, ver Sidebar.jsx). Todo el filtrado/orden pasa sobre el mock en
// memoria (MOCK_PACIENTES, ~12 filas de ejemplo) — no hay una simulación de
// fetch/paginación por página como en ListaPacientes: el encargo pide una
// pantalla de diseño con datos ficticios, no un backend de verdad, así que
// el filtrado es puramente client-side y síncrono (sin estado 'loading').
// El detalle de vacunación de un paciente (progreso del esquema, dosis
// aplicadas/pendientes, registrar nueva aplicación...) todavía no existe
// como vista propia — "Ver detalle" y las acciones del menú contextual son
// placeholders vía window.ncToast, mismo criterio "en desarrollo" que el
// resto del aplicativo, a la espera de esa pantalla.
export default function Vacunacion() {
  const [query, setQuery] = useState('');
  const [esquema, setEsquema] = useState('');
  const [estado, setEstado] = useState('');
  const [proxima, setProxima] = useState('');
  const [quickFilter, setQuickFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('estado');
  const [sortDir, setSortDir] = useState('asc');
  const [esquemaPaciente, setEsquemaPaciente] = useState(null);
  // null = modal cerrado; {} = abierto sin paciente precargado (CTA de la
  // barra de herramientas); { paciente: p } = abierto y precargado (fila →
  // "Registrar aplicación", ver VacRowMenu), arranca directo en el paso
  // "Vacuna" (ver RegistrarVacunacionModal.jsx).
  const [registrarModal, setRegistrarModal] = useState(null);

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  // Escape cierra el modal "Ver esquema completo" — mismo criterio que el
  // modal "Expandir esquema" dentro de EsquemaVacunacion.jsx.
  useEffect(() => {
    if (!esquemaPaciente) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setEsquemaPaciente(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [esquemaPaciente]);

  // Conteos del segmented control sobre el dataset completo (no sobre lo ya
  // filtrado por búsqueda/selects) — mismo criterio que un badge con
  // contador: siempre responde "cuántos hay en total en esa categoría", no
  // "cuántos quedan visibles ahora mismo".
  const quickFilterCounts = useMemo(() => ({
    todos: MOCK_PACIENTES.length,
    pendientes: MOCK_PACIENTES.filter((p) => p.estado === 'pendiente').length,
    atrasados: MOCK_PACIENTES.filter((p) => p.estado === 'atrasado').length,
    proximos: MOCK_PACIENTES.filter((p) => matchesProxima(p.fechaProgramadaDias, '7d')).length,
  }), []);

  const pacientes = useMemo(() => {
    const q = normalize(query);
    let next = MOCK_PACIENTES.filter((p) => {
      if (q && !normalize(p.nombre).includes(q) && !normalize(p.documento).includes(q)) return false;
      if (esquema && p.esquema !== esquema) return false;
      if (estado && p.estado !== estado) return false;
      if (proxima && !matchesProxima(p.fechaProgramadaDias, proxima)) return false;
      if (quickFilter === 'pendientes' && p.estado !== 'pendiente') return false;
      if (quickFilter === 'atrasados' && p.estado !== 'atrasado') return false;
      if (quickFilter === 'proximos' && !matchesProxima(p.fechaProgramadaDias, '7d')) return false;
      return true;
    });

    next = [...next].sort((a, b) => {
      let cmp;
      if (sortBy === 'estado') cmp = ESTADO_URGENCIA[a.estado] - ESTADO_URGENCIA[b.estado];
      else if (sortBy === 'fechaProgramadaDias') {
        // null (esquema completo, sin próxima dosis) siempre al final, sin
        // importar la dirección — no hay "antes/después" posible para algo
        // que no existe.
        if (a.fechaProgramadaDias === null) cmp = 1;
        else if (b.fechaProgramadaDias === null) cmp = -1;
        else cmp = a.fechaProgramadaDias - b.fechaProgramadaDias;
      } else if (typeof a[sortBy] === 'number') cmp = a[sortBy] - b[sortBy];
      else cmp = String(a[sortBy]).localeCompare(String(b[sortBy]), 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return next;
  }, [query, esquema, estado, proxima, quickFilter, sortBy, sortDir]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }

  function handleVerDetalle(p) {
    window.ncToast?.(`Detalle de vacunación de ${p.nombre} (en desarrollo).`);
  }

  function handleRegistrarAplicacion(p) {
    setRegistrarModal({ paciente: p });
  }

  function handleVerEsquema(p) {
    setEsquemaPaciente(p);
  }

  function handleEnviarRecordatorio(p) {
    window.ncToast?.(`Recordatorio enviado a ${p.nombre} (simulado — sin integración real).`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="PyMS"
          page="Vacunación"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="vac-page-head">
            <div>
              <h1>Vacunación</h1>
              <p>Gestiona los esquemas y registros de vacunación de tus pacientes.</p>
            </div>
            <div className="vac-page-head-actions">
              <Button variant="secondary" icon={LuListChecks} onClick={() => window.ncToast?.('Gestionar esquemas (en desarrollo).')}>
                Gestionar esquemas
              </Button>
              <Button icon={LuSyringe} onClick={() => setRegistrarModal({})}>
                Registrar vacunación
              </Button>
            </div>
          </div>

          <VacKpiRow />

          <div className="vac-card-shell">
            <VacToolbar
              query={query} onQueryChange={setQuery}
              esquema={esquema} onEsquemaChange={setEsquema}
              estado={estado} onEstadoChange={setEstado}
              proxima={proxima} onProximaChange={setProxima}
              quickFilter={quickFilter} onQuickFilterChange={setQuickFilter}
              counts={quickFilterCounts}
            />

            
            <VacTable
              pacientes={pacientes}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onVerDetalle={handleVerDetalle}
              onRegistrarAplicacion={handleRegistrarAplicacion}
              onVerEsquema={handleVerEsquema}
              onEnviarRecordatorio={handleEnviarRecordatorio}
            />

            <VacPagination count={pacientes.length} />
          </div>
        </div>
      </div>

      {esquemaPaciente && (
        <div className="modal-overlay vac-esquema-overlay" role="presentation" onClick={() => setEsquemaPaciente(null)}>
          <div
            className="modal-card vac-esquema-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vac-esquema-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              title="Esquema de vacunación"
              titleId="vac-esquema-modal-title"
              onClose={() => setEsquemaPaciente(null)}
              closeLabel="Cerrar esquema de vacunación"
              autoFocusClose
            />
            <div className="vac-esquema-patient-header">
              <span className="vac-esquema-patient-name">{esquemaPaciente.nombre}</span>
              <span className="vac-esquema-patient-sep" aria-hidden="true">·</span>
              <span>{esquemaPaciente.edadLabel}</span>
              <span className="vac-esquema-patient-sep" aria-hidden="true">·</span>
              <span>{esquemaPaciente.sexo}</span>
              <span className="vac-esquema-patient-sep" aria-hidden="true">·</span>
              <span>{esquemaPaciente.eps}</span>
            </div>
            <div className="modal-body vac-esquema-body">
              <EsquemaVacunacion mostrarEncabezado={false} mostrarOtrasVacunas={false} />
            </div>
          </div>
        </div>
      )}

      {registrarModal && (
        <RegistrarVacunacionModal
          pacienteInicial={registrarModal.paciente || null}
          onClose={() => setRegistrarModal(null)}
          onVerEsquema={(p) => setEsquemaPaciente(p)}
        />
      )}
    </div>
  );
}
