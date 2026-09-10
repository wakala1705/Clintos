'use client';

import { useEffect, useMemo, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import './Solicitudes.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import BodegaPickerButton from '@/Components/BodegaPickerButton/BodegaPickerButton';
import MovimientosToolbar from './MovimientosToolbar/MovimientosToolbar';
import MovimientosGrid from './MovimientosGrid/MovimientosGrid';
import MovimientosPagination from './MovimientosPagination/MovimientosPagination';
import MovimientoDetalleModal from './MovimientoDetalleModal/MovimientoDetalleModal';
import MovimientosTotalesFooter from './MovimientosTotalesFooter/MovimientosTotalesFooter';
import { MOVIMIENTOS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const PAGE_SIZE = 15;

const FILTROS_INICIALES = {
  tipo: 'debito', tipoArticulo: 'todos', procedencia: 'todos', estado: 'sin-confirmar', trns: 'sal',
  noDoc: '', noAdmision: '', noPrestacion: '',
};

function movimientoCoincide(m, filtros) {
  if (m.tipo !== filtros.tipo) return false;
  if (filtros.tipoArticulo !== 'todos' && m.tipoArticulo !== filtros.tipoArticulo) return false;
  if (filtros.procedencia !== 'todos' && m.procedenciaTipo !== filtros.procedencia) return false;
  if (filtros.estado !== 'todos' && m.estado !== filtros.estado) return false;
  if (m.trns !== filtros.trns) return false;
  if (filtros.noDoc && !m.consecutivo.toLowerCase().includes(filtros.noDoc.trim().toLowerCase())) return false;
  if (filtros.noAdmision && !m.noAdmision.includes(filtros.noAdmision.trim())) return false;
  if (filtros.noPrestacion && !m.noPrestacion.includes(filtros.noPrestacion.trim())) return false;
  return true;
}

function sumBy(list, pick) {
  return list.reduce((acc, item) => acc + pick(item), 0);
}

// Réplica de "Catálogo Movimiento De Inventario Salidas Asistenciales"
// (Módulo Contable -> Insumos Farmacia -> Solicitudes), construida con los
// componentes/tokens de este proyecto -- mismo criterio que
// FacturaVistaClasica: toolbar denso + grilla + detalle, filtrado 100% en
// memoria sobre el array mock (sin fetch simulado, ver mockSolicitudesData.js).
export default function Solicitudes() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [selectedId, setSelectedId] = useState(null);
  const [detalleMovimiento, setDetalleMovimiento] = useState(null);
  const [page, setPage] = useState(1);

  function handleFiltrosChange(patch) {
    setPage(1);
    setFiltros((f) => ({ ...f, ...patch }));
  }

  const movimientos = useMemo(
    () => MOVIMIENTOS.filter((m) => movimientoCoincide(m, filtros)),
    [filtros],
  );

  // Clamp defensivo (mismo criterio que effectiveSelectedId abajo): si el
  // set filtrado encoge por debajo de la página actual sin pasar por
  // handleFiltrosChange, cae a la última página válida en vez de quedar en
  // blanco.
  const totalPages = Math.max(1, Math.ceil(movimientos.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const movimientosPagina = useMemo(
    () => movimientos.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE),
    [movimientos, effectivePage],
  );

  // Base de conteo para los chips de Estado: todos los demás filtros ya
  // aplicados, pero ignorando el propio Estado -- mismo criterio que
  // PatientsPanel (los chips cuentan sobre la lista ya acotada por el resto
  // de filtros activos, no sobre el universo completo).
  const movimientosSinFiltroEstado = useMemo(
    () => MOVIMIENTOS.filter((m) => movimientoCoincide(m, { ...filtros, estado: 'todos' })),
    [filtros],
  );
  const estadoCounts = useMemo(() => ({
    todos: movimientosSinFiltroEstado.length,
    confirmado: movimientosSinFiltroEstado.filter((m) => m.estado === 'confirmado').length,
    'sin-confirmar': movimientosSinFiltroEstado.filter((m) => m.estado === 'sin-confirmar').length,
    anulado: movimientosSinFiltroEstado.filter((m) => m.estado === 'anulado').length,
  }), [movimientosSinFiltroEstado]);

  // Sin useState/useEffect: si la selección actual ya no está en la lista
  // filtrada (o todavía no hay ninguna), cae a la primera fila visible --
  // mismo patrón "siempre hay algo seleccionado" que FacturaVistaClasica.
  const effectiveSelectedId = movimientos.some((m) => m.id === selectedId) ? selectedId : (movimientos[0]?.id ?? null);
  const selectedMovimiento = movimientos.find((m) => m.id === effectiveSelectedId) ?? null;

  const totales = useMemo(() => {
    const articulos = selectedMovimiento?.articulos ?? [];
    const confirmados = articulos.filter((a) => a.confirmado);
    const sinConfirmar = articulos.filter((a) => !a.confirmado);
    return {
      costoConfirmado: sumBy(confirmados, (a) => a.costoTotal.neto),
      cantidadConfirmado: sumBy(confirmados, (a) => a.cantidadEntregada),
      costoSinConfirmar: sumBy(sinConfirmar, (a) => a.costoTotal.neto),
      cantidadSinConfirmar: sumBy(sinConfirmar, (a) => a.cantidadEntregada),
      totalIva: sumBy(articulos, (a) => a.iva.total),
    };
  }, [selectedMovimiento]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Inventario"
          page="Salidas asistenciales"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        >
          <BodegaPickerButton />
        </Topbar>

        <div className="content">
          <div className="mig-page-header">
            <div>
              <h1>Salidas asistenciales de inventario</h1>
              <p>Catálogo de movimientos de inventario tipo SA para dispensación y control asistencial</p>
            </div>
            <div className="mig-page-header-actions">
              <Button icon={LuPlus}>Nuevo</Button>
            </div>
          </div>

          <div className="card">
            <div className="mig-shell">
              <MovimientosToolbar
                filtros={filtros}
                onChange={handleFiltrosChange}
                estadoCounts={estadoCounts}
              />

              <MovimientosGrid
                movimientos={movimientosPagina}
                selectedId={effectiveSelectedId}
                onSelect={setSelectedId}
                onVerDetalle={setDetalleMovimiento}
              />

              <MovimientosPagination
                page={effectivePage}
                pageSize={PAGE_SIZE}
                total={movimientos.length}
                onChangePage={setPage}
              />

              <MovimientosTotalesFooter totales={totales} />
            </div>
          </div>
        </div>
      </div>

      <MovimientoDetalleModal movimiento={detalleMovimiento} onClose={() => setDetalleMovimiento(null)} />
    </div>
  );
}
