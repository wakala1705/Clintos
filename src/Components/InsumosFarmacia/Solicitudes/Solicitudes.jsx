'use client';

import { useEffect, useMemo, useState } from 'react';
import './Solicitudes.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import MovimientosToolbar from './MovimientosToolbar/MovimientosToolbar';
import MovimientosGrid from './MovimientosGrid/MovimientosGrid';
import MovimientoAccionesPanel from './MovimientoAccionesPanel/MovimientoAccionesPanel';
import MovimientoDetalle from './MovimientoDetalle/MovimientoDetalle';
import MovimientosTotalesFooter from './MovimientosTotalesFooter/MovimientosTotalesFooter';
import { MOVIMIENTOS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

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

  const movimientos = useMemo(
    () => MOVIMIENTOS.filter((m) => movimientoCoincide(m, filtros)),
    [filtros],
  );

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
          section="Insumos Farmacia"
          page="Solicitudes"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="mig-page-header">
            <h1>Salidas asistenciales de inventario</h1>
            <p>Catálogo de movimientos de inventario tipo SA para dispensación y control asistencial</p>
          </div>

          <div className="card">
            <div className="mig-shell">
              <MovimientosToolbar filtros={filtros} onChange={(patch) => setFiltros((f) => ({ ...f, ...patch }))} />

              <div className="mig-body">
                <MovimientosGrid movimientos={movimientos} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                <MovimientoAccionesPanel hasSelection={!!selectedMovimiento} />
              </div>

              <MovimientoDetalle key={effectiveSelectedId ?? 'none'} movimiento={selectedMovimiento} />

              <MovimientosTotalesFooter totales={totales} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
