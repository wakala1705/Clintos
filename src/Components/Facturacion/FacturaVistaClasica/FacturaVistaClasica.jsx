'use client';

import { useMemo, useState } from 'react';
import './FacturaVistaClasica.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  CLASE_OPTIONS, FACTURAS, TIPO_OPTIONS, matchesQuery,
} from '@/hooks/Facturacion/mockFacturasData';
import FacturasGridClasica from './FacturasGridClasica/FacturasGridClasica';
import FacturaDetalleClasico from './FacturaDetalleClasico/FacturaDetalleClasico';
import { LuRefreshCw, LuSearch } from 'react-icons/lu';

const FILTROS_INICIALES = { clase: 'todas', tipo: 'todas', desde: '', hasta: '' };

// Réplica del formulario legacy de Facturas (encargo explícito, ver imagen
// de referencia) -- toolbar de una sola fila con label+control inline (no
// el popover "Filtros" de la vista nueva), grilla densa con scroll propio y
// panel inferior siempre visible. Estado propio (no comparte query/filtros
// con FacturaListPane/Facturacion.jsx): son dos diseños distintos que se
// comparan lado a lado, no la misma pantalla con dos pieles.
export default function FacturaVistaClasica() {
  const [query, setQuery] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [selectedId, setSelectedId] = useState(null);

  const facturas = useMemo(() => FACTURAS.filter((f) => {
    if (filtros.clase !== 'todas' && f.clase !== filtros.clase) return false;
    if (filtros.tipo !== 'todas' && f.tipo !== filtros.tipo) return false;
    if (filtros.desde && f.fecha < filtros.desde) return false;
    if (filtros.hasta && f.fecha > filtros.hasta) return false;
    return matchesQuery(f, query.trim());
  }), [query, filtros]);

  // Sin useState/useEffect: si la selección actual ya no está en la lista
  // filtrada (o todavía no hay ninguna), cae a la primera fila visible --
  // mismo comportamiento "siempre hay algo seleccionado" del formulario
  // legacy de referencia, derivado en cada render en vez de sincronizado.
  const effectiveSelectedId = facturas.some((f) => f.id === selectedId) ? selectedId : (facturas[0]?.id ?? null);
  const selectedFactura = facturas.find((f) => f.id === effectiveSelectedId) ?? null;

  return (
    <div className="fvc-shell">
      <div className="fvc-toolbar">
        <div className="search-field fvc-search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar por factura, NIT, tercero, afiliado o admisión..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar por factura, NIT, tercero, afiliado o admisión"
          />
        </div>

        <div className="fvc-filter-field">
          <label htmlFor="fvc-clase">Clase:</label>
          <FormSelect id="fvc-clase" value={filtros.clase} onChange={(v) => setFiltros((f) => ({ ...f, clase: v }))} options={CLASE_OPTIONS} />
        </div>
        <div className="fvc-filter-field">
          <label htmlFor="fvc-tipo">Tipo:</label>
          <FormSelect id="fvc-tipo" value={filtros.tipo} onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))} options={TIPO_OPTIONS} />
        </div>
        <div className="fvc-filter-field">
          <label htmlFor="fvc-desde">Desde:</label>
          <input id="fvc-desde" type="date" value={filtros.desde} onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))} />
        </div>
        <div className="fvc-filter-field">
          <label htmlFor="fvc-hasta">Hasta:</label>
          <input id="fvc-hasta" type="date" value={filtros.hasta} onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))} />
        </div>

        <Button variant="secondary-accent" size="sm" icon={LuRefreshCw} className="fvc-refresh-btn">Refrescar</Button>
      </div>

      <FacturasGridClasica facturas={facturas} selectedId={effectiveSelectedId} onSelect={setSelectedId} />

      <FacturaDetalleClasico factura={selectedFactura} />
    </div>
  );
}
