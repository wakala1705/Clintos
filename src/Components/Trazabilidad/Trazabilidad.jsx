'use client';

import { useEffect, useRef, useState } from 'react';
import './Trazabilidad.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { fetchTrazabilidad, getDetalleTrabajo } from '@/hooks/Trazabilidad/mockTrazabilidadData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import TrazabilidadToolbar from './TrazabilidadToolbar/TrazabilidadToolbar';
import TrazabilidadTable from './TrazabilidadTable/TrazabilidadTable';
import TrazabilidadTableSkeleton from './TrazabilidadTableSkeleton/TrazabilidadTableSkeleton';
import TrazabilidadEmptyState from './TrazabilidadEmptyState/TrazabilidadEmptyState';
import TrazabilidadPagination from './TrazabilidadPagination/TrazabilidadPagination';
import DetalleTrabajoModal from './DetalleTrabajoModal/DetalleTrabajoModal';

const FILTROS_VACIOS = { estado: 'todos', tipo: 'todos', query: '', desde: '', hasta: '' };
const PAGE_SIZE = 20;

function hayFiltrosActivos(f) {
  return f.estado !== 'todos' || f.tipo !== 'todos' || f.query.trim() !== '' || f.desde !== '' || f.hasta !== '';
}

export default function Trazabilidad() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  // Filtrado en vivo (mismo criterio que el resto del proyecto, ver
  // AGENTS.md "Barra de filtros de listado" y GestionCamasAuditoria.jsx) --
  // cada cambio de filtro dispara fetchTrazabilidad directo, sin un paso
  // intermedio "draft" ni botones Buscar/Limpiar (se quitaron por encargo
  // explícito).
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading'); // loading | ready
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Id del trabajo abierto en DetalleTrabajoModal ("Ver" de cada fila) --
  // solo el id (no el objeto completo) para que reabrir el modal siempre
  // lea el detalle fresco vía getDetalleTrabajo, mismo criterio que
  // detalleId en Admisiones.jsx/DetalleAdmisionModal.
  const [verTrabajoId, setVerTrabajoId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  // "loading" solo se marca dentro del callback (asíncrono) o desde
  // manejadores de evento (handleBuscar/handleLimpiar abajo) -- nunca de
  // forma síncrona en el cuerpo del efecto (ver AGENTS.md / react-hooks/
  // set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    fetchTrazabilidad({ ...filtros, page, pageSize: PAGE_SIZE }).then(({ items: fetched, total: fetchedTotal }) => {
      if (cancelled) return;
      setItems(fetched);
      setTotal(fetchedTotal);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [filtros, page]);

  function handleFiltrosChange(patch) {
    setStatus('loading');
    setFiltros((f) => ({ ...f, ...patch }));
    setPage(1);
  }
  function handleReintentarColgados() {
    showToast('Reintentando trabajos colgados (en desarrollo).');
  }
  function handleVer(trabajo) {
    setVerTrabajoId(trabajo.id);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Finanzas"
          page="Trazabilidad"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content traz-content">
          <div className="traz-page-header">
            <h1>Trazabilidad de Trabajos de Facturación</h1>
            <p>Auditoría y control de los procesos de facturación e imputación.</p>
          </div>

          <div className="card traz-table-card">
            <TrazabilidadToolbar
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              onReintentarColgados={handleReintentarColgados}
            />

            {status === 'loading' && <TrazabilidadTableSkeleton />}
            {status === 'ready' && items.length === 0 && (
              <TrazabilidadEmptyState subtitle={hayFiltrosActivos(filtros) ? 'Prueba con otros criterios de búsqueda.' : undefined} />
            )}
            {status === 'ready' && items.length > 0 && (
              <>
                <div className="traz-table-wrap">
                  <TrazabilidadTable items={items} onVer={handleVer} />
                </div>
                <TrazabilidadPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChangePage={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <DetalleTrabajoModal trabajo={verTrabajoId ? getDetalleTrabajo(verTrabajoId) : null} onClose={() => setVerTrabajoId(null)} />

      <div className={`traz-toast${toast ? ' show' : ''}`}>
        <span className="traz-toast-dot"></span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
