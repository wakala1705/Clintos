'use client';

import { useEffect, useMemo, useState } from 'react';
import './FacturaVistaClasica.css';
import Button from '@/Components/Button/Button';
import SplitPane from '@/Components/SplitPane/SplitPane';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  CLASE_OPTIONS, FACTURAS, TIPO_OPTIONS, matchesQuery,
} from '@/hooks/Facturacion/mockFacturasData';
import DateRangeFilter from './DateRangeFilter/DateRangeFilter';
import TipoFacturaFilter from './TipoFacturaFilter/TipoFacturaFilter';
import FacturasGridClasica from './FacturasGridClasica/FacturasGridClasica';
import FacturaDetalleClasico from './FacturaDetalleClasico/FacturaDetalleClasico';
import FacturaDetalleModalClasico from './FacturaDetalleModalClasico/FacturaDetalleModalClasico';
import FacturaDetalleSplit from './FacturaDetalleSplit/FacturaDetalleSplit';
import FacturaAgregarModalClasico from './FacturaAgregarModalClasico/FacturaAgregarModalClasico';
import AnularFacturaModal from './AnularFacturaModal/AnularFacturaModal';
import PrintLoadingModal from './PrintLoadingModal/PrintLoadingModal';
import FacturaPdfViewerModal from './FacturaPdfViewerModal/FacturaPdfViewerModal';
import VistaModoMenu from './VistaModoMenu/VistaModoMenu';
import {
  SPLIT_RATIO_DEFAULT, setSplitRatio, setVistaModo, useSplitRatio, useVistaModo,
} from '@/hooks/Facturacion/vistaClasicaPrefs';
import { resetFacturasStore, useFacturasStore } from '@/hooks/Facturacion/facturasStore';
import { LuRefreshCw } from 'react-icons/lu';

import SearchField from '@/Components/SearchField/SearchField';
// Delay artificial del paso 1 del flujo de impresión (ver handleImprimir más
// abajo) -- sin backend real (mockFacturasData.js: "solo pinta el front"),
// simula el tiempo de generación antes de mostrar el visor de PDF.
const PRINT_LOADING_DELAY_MS = 1200;

// Usuario de una anulación hecha desde AnularFacturaModal (encargo
// explícito) -- a diferencia de anuladaPor de las filas ya generadas como
// 'anulada' en mockFacturasData.js (variado, sembrado por seed), acá
// siempre es el mismo (sin auth real todavía -- mismo usuario del Topbar,
// ver Facturacion.jsx). El motivo en sí ya no es fijo: lo escribe el
// usuario en el campo "Motivo de anulación" del diálogo (encargo explícito)
// y llega como argumento a handleConfirmarAnular más abajo.
const ANULADO_POR_ACTUAL = 'Camilo Grondona';

function fechaHoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function horaActualLabel() {
  const d = new Date();
  const h24 = d.getHours();
  const meridiano = h24 < 12 ? 'a. m.' : 'p. m.';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(d.getMinutes()).padStart(2, '0')} ${meridiano}`;
}

// Opciones del filtro "Tipo Factura" sin el sentinel "todas" de TIPO_OPTIONS
// (ese sentinel es para el FormSelect de selección única de
// FiltrosFacturasPopover.jsx, vista nueva -- acá cada opción es un checkbox
// propio, ver TipoFacturaFilter.jsx).
const TIPO_FACTURA_OPTIONS = TIPO_OPTIONS.filter((o) => o.value !== 'todas');
const TIPO_FACTURA_VALUES = TIPO_FACTURA_OPTIONS.map((o) => o.value);

const FILTROS_INICIALES = {
  clase: 'todas', tipo: TIPO_FACTURA_VALUES, desde: '', hasta: '', pe: 'todos',
};

// Réplica del formulario legacy de Facturas (encargo explícito, ver imagen
// de referencia) -- toolbar de una sola fila con label+control inline (no
// el popover "Filtros" de la vista nueva), grilla densa con scroll propio y
// panel inferior siempre visible. Estado propio (no comparte query/filtros
// con FacturaListPane/Facturacion.jsx): son dos diseños distintos que se
// comparan lado a lado, no la misma pantalla con dos pieles.
// Modos de vista (encargo explícito, elección recordada entre visitas vía
// vistaClasicaPrefs):
// - "Lista": grilla de facturas + barra inferior con la admisión/total
//   (FacturaDetalleClasico); el detalle completo se abre en el modal "Ver
//   detalle" (ícono de ojo / doble clic).
// - "Dividida": grilla arriba y detalle compacto de la factura seleccionada
//   abajo (FacturaDetalleSplit), separados por un divisor arrastrable
//   (SplitPane, proporción también recordada). El modal "Ver detalle" no
//   existe en este modo -- sería el mismo contenido que ya está en pantalla.
// El toggle Lista/Dividida vive en VistaModoMenu.jsx (encargo explícito:
// agrupar el segmented-control en un solo botón de "configuración" con
// dropdown, ver ese componente) -- sus opciones ya no se listan acá.

export default function FacturaVistaClasica() {
  const modo = useVistaModo();
  const splitRatio = useSplitRatio();
  // Facturas creadas/editadas por "Guardar" (FacturaAgregarModalClasico, ver
  // facturasStore.js) -- store aparte porque "Nueva factura" se abre desde
  // Facturacion.jsx (padre de este componente), no desde acá adentro.
  const { facturasNuevas, facturasEditadas } = useFacturasStore();
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
  // Override local de `estadoFacturacion` (id -> 'facturada'), aplicado por
  // handleFacturar cuando se confirma la acción "Facturar" del modal de
  // detalle -- mismo criterio que estadoPEOverrides de arriba.
  const [estadoFacturacionOverrides, setEstadoFacturacionOverrides] = useState({});
  // Override local de `estado`/motivo/quién/cuándo (id -> objeto completo),
  // aplicado por handleConfirmarAnular cuando se confirma AnularFacturaModal
  // -- mismo criterio que los dos overrides de arriba, pero guarda el objeto
  // entero (no un solo valor) porque además de `estado: 'anulada'` hay que
  // fijar motivoAnulacion/anuladaPor/fechaAnulacion/horaAnulacion para que
  // el aviso "Factura anulada" (FacturaDetalleModalClasico/
  // FacturaDetalleSplit) tenga qué mostrar.
  const [estadoOverrides, setEstadoOverrides] = useState({});
  // Factura pendiente de confirmar en AnularFacturaModal -- null = cerrado.
  const [anulandoFactura, setAnulandoFactura] = useState(null);
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

  const facturasConOverrides = useMemo(() => {
    // facturasNuevas primero (encargo: "Guardar" bajo Agregar debe verse en
    // la tabla) -- FACTURAS es el dataset mock, facturasNuevas vive aparte
    // en facturasStore.js (ver import arriba).
    const base = facturasNuevas.length > 0 ? [...facturasNuevas, ...FACTURAS] : FACTURAS;
    const sinOverrides = Object.keys(estadoPEOverrides).length === 0
      && Object.keys(estadoFacturacionOverrides).length === 0
      && Object.keys(estadoOverrides).length === 0
      && Object.keys(facturasEditadas).length === 0;
    if (sinOverrides) return base;
    return base.map((f) => (
      estadoPEOverrides[f.id] || estadoFacturacionOverrides[f.id] || estadoOverrides[f.id] || facturasEditadas[f.id]
        ? {
          ...f,
          ...(estadoPEOverrides[f.id] ? { estadoPE: estadoPEOverrides[f.id] } : null),
          ...(estadoFacturacionOverrides[f.id] ? { estadoFacturacion: estadoFacturacionOverrides[f.id] } : null),
          ...(estadoOverrides[f.id] ?? null),
          // "Guardar" bajo Editar (facturasEditadas) va al final: si el
          // usuario editó una factura que también tenía un override previo
          // (ej. ya "Facturada"), el objeto completo que armó el formulario
          // gana -- es el dato más reciente e intencional de los 4.
          ...(facturasEditadas[f.id] ?? null),
        }
        : f
    ));
  }, [facturasNuevas, facturasEditadas, estadoPEOverrides, estadoFacturacionOverrides, estadoOverrides]);

  // Sin el filtro "pe" -- separado de `facturas` de abajo solo para no
  // repetir el resto de los filtros dos veces.
  const facturasSinPe = useMemo(() => facturasConOverrides.filter((f) => {
    if (filtros.clase !== 'todas' && f.clase !== filtros.clase) return false;
    if (filtros.tipo.length > 0 && !filtros.tipo.includes(f.tipo)) return false;
    if (filtros.desde && f.fecha < filtros.desde) return false;
    if (filtros.hasta && f.fecha > filtros.hasta) return false;
    return matchesQuery(f, query.trim());
  }), [facturasConOverrides, query, filtros.clase, filtros.tipo, filtros.desde, filtros.hasta]);

  const facturas = useMemo(() => (
    filtros.pe === 'todos' ? facturasSinPe : facturasSinPe.filter((f) => f.estadoPE === filtros.pe)
  ), [facturasSinPe, filtros.pe]);

  // Sin useState/useEffect: si la selección actual ya no está en la lista
  // filtrada (o todavía no hay ninguna), cae a la primera fila visible --
  // mismo comportamiento "siempre hay algo seleccionado" del formulario
  // legacy de referencia, derivado en cada render en vez de sincronizado.
  const effectiveSelectedId = facturas.some((f) => f.id === selectedId) ? selectedId : (facturas[0]?.id ?? null);
  const selectedFactura = facturas.find((f) => f.id === effectiveSelectedId) ?? null;

  // "Limpiar filtros" del empty state de FacturasGridClasica (encargo: sin
  // resultados, la tabla quedaba vacía sin ningún mensaje) -- resetea todo
  // lo que puede dejar la grilla sin filas: búsqueda + los 5 filtros.
  function handleLimpiarTodosLosFiltros() {
    setQuery('');
    setFiltros(FILTROS_INICIALES);
  }

  // Ícono de imprimir (columna Acciones, ver FacturasGridClasica) -- si ya
  // hay un flujo en curso se ignora (una factura a la vez, mismo criterio
  // que editFactura/detalleFactura).
  function handleImprimir(factura) {
    if (printFlow) return;
    setPrintFlow({ factura, stage: 'loading' });
  }

  // Acción "Facturar" del modal de detalle (encargo) -- pasa esa factura a
  // 'facturada' vía estadoFacturacionOverrides, mismo criterio que
  // handleImprimir/estadoPEOverrides.
  function handleFacturar(id) {
    setEstadoFacturacionOverrides((overrides) => ({ ...overrides, [id]: 'facturada' }));
  }

  // "Anular" del menú de fila (RowActionsMenu) -- abre AnularFacturaModal en
  // vez de anular directo, mismo criterio que handleImprimir/printFlow (una
  // decisión destructiva no se aplica sin el paso de confirmación de por
  // medio).
  function handleAnular(factura) {
    setAnulandoFactura(factura);
  }

  // Confirmación ("Sí, anular factura") de AnularFacturaModal -- pasa esa
  // factura a 'anulada' vía estadoOverrides, con el motivo que tipeó el
  // usuario en el diálogo + usuario/fecha/hora de la anulación interactiva.
  function handleConfirmarAnular(id, motivo) {
    setEstadoOverrides((overrides) => ({
      ...overrides,
      [id]: {
        estado: 'anulada',
        motivoAnulacion: motivo,
        anuladaPor: ANULADO_POR_ACTUAL,
        fechaAnulacion: fechaHoyISO(),
        horaAnulacion: horaActualLabel(),
      },
    }));
    setAnulandoFactura(null);
  }

  // Botón "Refrescar" (encargo: antes sin onClick, parecía funcional pero no
  // hacía nada) -- FACTURAS es un array mock estático, no hay backend real
  // que refetchear todavía (ver mockFacturasData.js), así que "refrescar"
  // vuelve el estado de la pantalla a su punto de partida: limpia
  // búsqueda/filtros y descarta los overrides locales de estadoPE/
  // estadoFacturacion/estado aplicados por el flujo de impresión, "Facturar"
  // y "Anular" -- también las facturas creadas/editadas por "Guardar"
  // (facturasStore.js): son igual de locales, ningún backend real se enteró
  // de ninguna de estas.
  // Delay artificial corto + ícono girando (ver .fvc-refreshing en
  // shared.css) para que el clic tenga feedback visible en vez de un cambio
  // instantáneo indistinguible de "no pasó nada".
  const [refreshing, setRefreshing] = useState(false);
  function handleRefrescar() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setQuery('');
      setFiltros(FILTROS_INICIALES);
      setEstadoPEOverrides({});
      setEstadoFacturacionOverrides({});
      setEstadoOverrides({});
      resetFacturasStore();
      setRefreshing(false);
    }, 450);
  }

  return (
    <div className="fvc-shell">
      <div className="fvc-toolbar">
        <SearchField className="fact-search fvc-search-field" value={query} onChange={(v) => setQuery(v)} placeholder="Buscar por factura, NIT, tercero o afiliado..." ariaLabel="Buscar por factura, NIT, tercero o afiliado" />

        <div className="filter-spacer" />

        <div className="fvc-filter-field">
          <label htmlFor="fvc-clase">Clase:</label>
          <FormSelect id="fvc-clase" value={filtros.clase} onChange={(v) => setFiltros((f) => ({ ...f, clase: v }))} options={CLASE_OPTIONS} />
        </div>

        <div className="fvc-filter-field">
          <label htmlFor="fvc-tipo">Tipo:</label>
          <TipoFacturaFilter
            id="fvc-tipo"
            ariaLabel="Tipo Factura"
            value={filtros.tipo}
            onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))}
            options={TIPO_FACTURA_OPTIONS}
          />
        </div>

        <DateRangeFilter
          desde={filtros.desde}
          hasta={filtros.hasta}
          onChange={({ desde, hasta }) => setFiltros((f) => ({ ...f, desde, hasta }))}
        />

        <Button
          variant="secondary-accent"
          size="sm"
          icon={LuRefreshCw}
          className={`fvc-refresh-btn${refreshing ? ' fvc-refreshing' : ''}`}
          onClick={handleRefrescar}
          disabled={refreshing}
        >
          Refrescar
        </Button>

        <VistaModoMenu modo={modo} onChange={setVistaModo} />
      </div>

      {modo === 'dividida' ? (
        <SplitPane
          ratio={splitRatio}
          onRatioChange={setSplitRatio}
          defaultRatio={SPLIT_RATIO_DEFAULT}
          label="Redimensionar lista de facturas y detalle"
          top={(
            <FacturasGridClasica
              facturas={facturas}
              selectedId={effectiveSelectedId}
              onSelect={setSelectedId}
              onEditar={setEditFactura}
              onImprimir={handleImprimir}
              onAnular={handleAnular}
              onClearFilters={handleLimpiarTodosLosFiltros}
            />
          )}
          bottom={<FacturaDetalleSplit factura={selectedFactura} onFacturar={handleFacturar} />}
        />
      ) : (
        <>
          <FacturasGridClasica
            facturas={facturas}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            onVerDetalle={setDetalleFactura}
            onEditar={setEditFactura}
            onImprimir={handleImprimir}
            onAnular={handleAnular}
            onClearFilters={handleLimpiarTodosLosFiltros}
          />

          <FacturaDetalleClasico factura={selectedFactura} />

          <FacturaDetalleModalClasico
            factura={detalleFactura}
            onClose={() => setDetalleFactura(null)}
            onFacturar={handleFacturar}
          />
        </>
      )}

      {editFactura && (
        <FacturaAgregarModalClasico factura={editFactura} onClose={() => setEditFactura(null)} />
      )}

      <AnularFacturaModal
        factura={anulandoFactura}
        onClose={() => setAnulandoFactura(null)}
        onConfirm={handleConfirmarAnular}
      />

      {printFlow?.stage === 'loading' && (
        <PrintLoadingModal numero={printFlow.factura.numero} />
      )}
      {printFlow?.stage === 'viewer' && (
        <FacturaPdfViewerModal numero={printFlow.factura.numero} onClose={() => setPrintFlow(null)} />
      )}
    </div>
  );
}
