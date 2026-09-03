'use client';

import { useMemo, useState } from 'react';
import './FacturaVistaClasica.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import {
  CLASE_OPTIONS, FACTURAS, TIPO_OPTIONS, matchesQuery,
} from '@/hooks/Facturacion/mockFacturasData';
import FacturasGridClasica from './FacturasGridClasica/FacturasGridClasica';
import FacturaDetalleClasico from './FacturaDetalleClasico/FacturaDetalleClasico';
import FacturaDetalleModalClasico from './FacturaDetalleModalClasico/FacturaDetalleModalClasico';
import { LuRefreshCw, LuSearch } from 'react-icons/lu';

const FILTROS_INICIALES = {
  clase: 'todas', tipo: 'todas', desde: '', hasta: '', pe: 'todos',
};

// Opciones del chip rápido "PE" (encargo explícito) -- mismas keys que
// ESTADO_PE en FacturasGridClasica.jsx (pendiente/fe-pendiente/enviada), acá
// con etiquetas cortas para el chip en vez de la etiqueta completa del badge
// ("Factura electrónica pendiente").
const PE_FILTROS = [
  { value: 'todos', label: 'Todo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'fe-pendiente', label: 'F.E. Pendiente' },
  { value: 'enviada', label: 'Enviada' },
];

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
  const [detalleFactura, setDetalleFactura] = useState(null);

  // Sin el filtro "pe" -- se reusa tanto para el conteo de cada chip (cuántas
  // facturas tendría cada opción de PE con el resto de filtros ya aplicados)
  // como para la lista final de abajo.
  const facturasSinPe = useMemo(() => FACTURAS.filter((f) => {
    if (filtros.clase !== 'todas' && f.clase !== filtros.clase) return false;
    if (filtros.tipo !== 'todas' && f.tipo !== filtros.tipo) return false;
    if (filtros.desde && f.fecha < filtros.desde) return false;
    if (filtros.hasta && f.fecha > filtros.hasta) return false;
    return matchesQuery(f, query.trim());
  }), [query, filtros.clase, filtros.tipo, filtros.desde, filtros.hasta]);

  const peOpciones = useMemo(() => PE_FILTROS.map((o) => ({
    ...o,
    count: o.value === 'todos' ? facturasSinPe.length : facturasSinPe.filter((f) => f.estadoPE === o.value).length,
  })), [facturasSinPe]);

  const facturas = useMemo(() => (
    filtros.pe === 'todos' ? facturasSinPe : facturasSinPe.filter((f) => f.estadoPE === filtros.pe)
  ), [facturasSinPe, filtros.pe]);

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

        <SegmentedFilterBar
          options={peOpciones}
          value={filtros.pe}
          onChange={(v) => setFiltros((f) => ({ ...f, pe: v }))}
          ariaLabel="Filtrar por PE"
        />

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

      <FacturasGridClasica
        facturas={facturas}
        selectedId={effectiveSelectedId}
        onSelect={setSelectedId}
        onVerDetalle={setDetalleFactura}
      />

      <FacturaDetalleClasico factura={selectedFactura} />

      <FacturaDetalleModalClasico factura={detalleFactura} onClose={() => setDetalleFactura(null)} />
    </div>
  );
}
