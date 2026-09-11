'use client';

import { useEffect, useMemo, useState } from 'react';
import './FacturaVistaClasica.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  CLASE_OPTIONS, FACTURAS, TIPO_OPTIONS, matchesQuery,
} from '@/hooks/Facturacion/mockFacturasData';
import DateRangeFilter from './DateRangeFilter/DateRangeFilter';
import OtrosFiltrosPopover from './OtrosFiltrosPopover/OtrosFiltrosPopover';
import FacturasGridClasica from './FacturasGridClasica/FacturasGridClasica';
import FacturaDetalleClasico from './FacturaDetalleClasico/FacturaDetalleClasico';
import FacturaDetalleModalClasico from './FacturaDetalleModalClasico/FacturaDetalleModalClasico';
import FacturaEditarModalClasico from './FacturaEditarModalClasico/FacturaEditarModalClasico';
import PrintLoadingModal from './PrintLoadingModal/PrintLoadingModal';
import FacturaPdfViewerModal from './FacturaPdfViewerModal/FacturaPdfViewerModal';
import { LuRefreshCw, LuSearch } from 'react-icons/lu';

// Delay artificial del paso 1 del flujo de impresión (ver handleImprimir más
// abajo) -- sin backend real (mockFacturasData.js: "solo pinta el front"),
// simula el tiempo de generación antes de mostrar el visor de PDF.
const PRINT_LOADING_DELAY_MS = 1200;

// Opciones del filtro "Tipo Factura" sin el sentinel "todas" de TIPO_OPTIONS
// (ese sentinel es para el FormSelect de selección única de
// FiltrosFacturasPopover.jsx, vista nueva -- acá cada opción es un checkbox
// propio, ver TipoFacturaFilter.jsx).
const TIPO_FACTURA_OPTIONS = TIPO_OPTIONS.filter((o) => o.value !== 'todas');
const TIPO_FACTURA_VALUES = TIPO_FACTURA_OPTIONS.map((o) => o.value);

const FILTROS_INICIALES = {
  clase: 'todas', tipo: TIPO_FACTURA_VALUES, desde: '', hasta: '', pe: 'todos',
};

// Opciones del dropdown "PE" (encargo explícito: antes chip segmentado, ahora
// select dropdown normal -- mismo patrón/componente que "Tipo Factura", ver
// FormSelect más abajo) -- mismas keys que ESTADO_PE en
// FacturasGridClasica.jsx (pendiente/fe-pendiente/enviada), acá con
// etiquetas cortas en vez de la etiqueta completa del badge ("Factura
// electrónica pendiente").
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
  const [editFactura, setEditFactura] = useState(null);

  // Override local de `estadoPE` (id -> 'enviada'), aplicado por
  // handleImprimir/el efecto de abajo cuando termina el flujo de impresión de
  // una factura "pendiente" -- FACTURAS es el dataset mock compartido (ver
  // mockFacturasData.js), no se muta directamente.
  const [estadoPEOverrides, setEstadoPEOverrides] = useState({});
  // Flujo de impresión disparado por el ícono de la columna Acciones (ver
  // onImprimir más abajo): null = sin flujo activo; 'loading' = modal de
  // carga simulada; 'viewer' = visor de PDF. Solo una factura a la vez.
  const [printFlow, setPrintFlow] = useState(null);

  useEffect(() => {
    if (!printFlow || printFlow.stage !== 'loading') return undefined;
    const { factura } = printFlow;
    const timer = setTimeout(() => {
      if (factura.estadoPE === 'pendiente') {
        setEstadoPEOverrides((overrides) => ({ ...overrides, [factura.id]: 'enviada' }));
      }
      setPrintFlow({ factura, stage: 'viewer' });
    }, PRINT_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [printFlow]);

  const facturasConEstadoPE = useMemo(() => (
    Object.keys(estadoPEOverrides).length === 0 ? FACTURAS : FACTURAS.map((f) => (
      estadoPEOverrides[f.id] ? { ...f, estadoPE: estadoPEOverrides[f.id] } : f
    ))
  ), [estadoPEOverrides]);

  // Sin el filtro "pe" -- separado de `facturas` de abajo solo para no
  // repetir el resto de los filtros dos veces.
  const facturasSinPe = useMemo(() => facturasConEstadoPE.filter((f) => {
    if (filtros.clase !== 'todas' && f.clase !== filtros.clase) return false;
    if (filtros.tipo.length > 0 && !filtros.tipo.includes(f.tipo)) return false;
    if (filtros.desde && f.fecha < filtros.desde) return false;
    if (filtros.hasta && f.fecha > filtros.hasta) return false;
    return matchesQuery(f, query.trim());
  }), [facturasConEstadoPE, query, filtros.clase, filtros.tipo, filtros.desde, filtros.hasta]);

  const facturas = useMemo(() => (
    filtros.pe === 'todos' ? facturasSinPe : facturasSinPe.filter((f) => f.estadoPE === filtros.pe)
  ), [facturasSinPe, filtros.pe]);

  // Sin useState/useEffect: si la selección actual ya no está en la lista
  // filtrada (o todavía no hay ninguna), cae a la primera fila visible --
  // mismo comportamiento "siempre hay algo seleccionado" del formulario
  // legacy de referencia, derivado en cada render en vez de sincronizado.
  const effectiveSelectedId = facturas.some((f) => f.id === selectedId) ? selectedId : (facturas[0]?.id ?? null);
  const selectedFactura = facturas.find((f) => f.id === effectiveSelectedId) ?? null;

  // Badge de "Otros filtros" (Clase/Tipo Factura, ver OtrosFiltrosPopover) --
  // 1 punto por control con un valor distinto al inicial, no por cantidad de
  // tipos deseleccionados.
  const otrosFiltrosCount = (filtros.clase !== 'todas' ? 1 : 0)
    + (filtros.tipo.length !== TIPO_FACTURA_VALUES.length ? 1 : 0);

  function handleLimpiarOtrosFiltros() {
    setFiltros((f) => ({ ...f, clase: 'todas', tipo: TIPO_FACTURA_VALUES }));
  }

  // Ícono de imprimir (columna Acciones, ver FacturasGridClasica) -- si ya
  // hay un flujo en curso se ignora (una factura a la vez, mismo criterio
  // que editFactura/detalleFactura).
  function handleImprimir(factura) {
    if (printFlow) return;
    setPrintFlow({ factura, stage: 'loading' });
  }

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

        <div className="filter-spacer" />

        <div className="fvc-filter-field">
          <label htmlFor="fvc-pe">PE:</label>
          <FormSelect id="fvc-pe" value={filtros.pe} onChange={(v) => setFiltros((f) => ({ ...f, pe: v }))} options={PE_FILTROS} />
        </div>

        <OtrosFiltrosPopover
          clase={filtros.clase}
          onChangeClase={(v) => setFiltros((f) => ({ ...f, clase: v }))}
          claseOptions={CLASE_OPTIONS}
          tipo={filtros.tipo}
          onChangeTipo={(v) => setFiltros((f) => ({ ...f, tipo: v }))}
          tipoOptions={TIPO_FACTURA_OPTIONS}
          onLimpiar={handleLimpiarOtrosFiltros}
          activeCount={otrosFiltrosCount}
        />
        <DateRangeFilter
          desde={filtros.desde}
          hasta={filtros.hasta}
          onChange={({ desde, hasta }) => setFiltros((f) => ({ ...f, desde, hasta }))}
        />

        <Button variant="secondary-accent" size="sm" icon={LuRefreshCw} className="fvc-refresh-btn">Refrescar</Button>
      </div>

      <FacturasGridClasica
        facturas={facturas}
        selectedId={effectiveSelectedId}
        onSelect={setSelectedId}
        onVerDetalle={setDetalleFactura}
        onEditar={setEditFactura}
        onImprimir={handleImprimir}
      />

      <FacturaDetalleClasico factura={selectedFactura} />

      <FacturaDetalleModalClasico factura={detalleFactura} onClose={() => setDetalleFactura(null)} />

      {editFactura && (
        <FacturaEditarModalClasico factura={editFactura} onClose={() => setEditFactura(null)} />
      )}

      {printFlow?.stage === 'loading' && (
        <PrintLoadingModal numero={printFlow.factura.numero} />
      )}
      {printFlow?.stage === 'viewer' && (
        <FacturaPdfViewerModal numero={printFlow.factura.numero} onClose={() => setPrintFlow(null)} />
      )}
    </div>
  );
}
