'use client';

import { useMemo, useState, useEffect } from 'react';
import './AlistarPedidoModal.css';
import { LuPackage, LuRefreshCw, LuThumbsUp } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import ArticulosItemsTable from './ArticulosItemsTable/ArticulosItemsTable';
import LotesDisponiblesTable from './LotesDisponiblesTable/LotesDisponiblesTable';
import ConfirmarAlistamientoModal from './ConfirmarAlistamientoModal/ConfirmarAlistamientoModal';

// Mismo mapa tono/label que MovimientosGrid.jsx (estado del movimiento
// completo, no del ítem) -- se muestra junto al título en mig-alistar-identity,
// réplica del "Estado: 0-Sin Confirmado" de la referencia.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

// Un movimiento "Sin Confirmar" todavía no entregó nada de verdad (encargo
// explícito) -- aunque cantidadEntregada venga > 0 en el mock, se muestra
// "Pendiente" para todos sus ítems mientras el movimiento como un todo siga
// sin confirmar. Solo "Confirmado"/"Anulado" respetan cantidadEntregada tal
// cual. Mismo criterio duplicado en ArticulosItemsTable.jsx (ver ese
// archivo), que es quien realmente pinta el Badge -- esta copia solo
// alimenta filtroEstadoEntrega, hoy sin control visible que lo cambie.
function estadoEntregaDe(a, movimientoEstado) {
  if (movimientoEstado === 'sin-confirmar') return 'pendiente';
  return a.cantidadEntregada > 0 ? 'entregado' : 'pendiente';
}

// Réplica de "Catálogo Movimiento De Inventario -> Artículos Genéricos"
// (acción "Alistar pedido" de un movimiento Sin Confirmar) -- iteración
// sobre la primera versión visual (encargo explícito) sobre datos mock
// (`movimiento.articulos`/`.lotes`, ver mockSolicitudesData.js); Editar/
// Borrar/Movimiento siguen siendo visual-only (mismo criterio que Editar/
// Imprimir/Anular en MovimientoRowMenu) -- Sugerir y Confirmar ya no lo son,
// ver más abajo. El "mig-tabs-bar" (Por Consecutivo/Por Id Articulo)
// se eliminó (encargo explícito) -- mismo criterio que MovimientoDetalleModal
// (que ya pasó por esto: tabs sin contenido diferenciado real se reemplazan
// por el contenido plano directo, no por un selector que no aporta).
//
// Rediseño (encargo explícito: "repliquemos el mismo diseño del detalle de
// facturas") sobre FacturaDetalleModalClasico.jsx -- mig-alistar-identity
// (ícono+título+badge+subtítulo, paciente/admisión, Solicitante) es el mismo
// patrón que fvcd-identity-row. El "mig-resumen" (fvcd-compact-fields, resto
// de campos del movimiento) se eliminó (encargo explícito) -- Solicitante,
// el único dato de ese bloque que se conservó, se movió a la identity row.
// El "Resumen" de Facturas (fvcd-bottom-summary, responde a la fila
// seleccionada de la tabla) se aplicó puntualmente a la SEGUNDA tabla
// (encargo explícito) -- mig-lotes-summary, a la derecha de
// LotesDisponiblesTable, responde a `effectiveLoteIndex`. A diferencia de
// fvcd-summary-hint, acá el primer lote llega seleccionado por defecto
// (encargo explícito) -- el hint solo se ve cuando no hay lotes.
//
// `cantidadOverrides` (keyed por loteSerie, encargo explícito "simulemos el
// guardado") vive acá -- no en LotesDisponiblesTable -- porque Confirmar
// necesita sumarlo por ÍTEM (todos los lotes de todos los ítems del
// documento, no solo los del ítem seleccionado) para validar que cada uno
// quedó completamente repartido antes de habilitar el botón. La tabla de
// lotes queda puramente presentacional: recibe `lotes` ya fusionados y
// dispara `onCantidadChange`/`onSugerirTodos` hacia acá.
export default function AlistarPedidoModal({ movimiento, onClose, onConfirmar }) {
  // 'use no memo' (encargo: bug real, ver bitácora del chat) -- el React
  // Compiler (reactCompiler:true en next.config.mjs) auto-memoiza
  // `articulosFiltrados`/`itemsSinResolver` (dependen de `movimiento?.articulos`,
  // necesario porque este componente se monta siempre, sin
  // `{alistarMovimiento && ...}` en Solicitudes.jsx, así que `movimiento` es
  // `null` en el primer render) generando una comparación de caché que lee
  // `movimiento.articulos` SIN el `?.` -- revienta con
  // "Cannot read properties of null (reading 'articulos')" apenas carga la
  // página. No es un bug de este archivo: es una narrowing incorrecta del
  // compilador sobre optional chaining cuando el objeto puede ser null en el
  // primer render. Esta directiva desactiva la auto-memoización SOLO en este
  // componente (los demás siguen optimizados).
  'use no memo';

  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroEstadoEntrega, setFiltroEstadoEntrega] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLoteIndex, setSelectedLoteIndex] = useState(null);
  const [cantidadOverrides, setCantidadOverrides] = useState({});
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    if (!movimiento) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movimiento, onClose]);

  // Reinicia filtros/selección al abrir un movimiento distinto -- ajuste de
  // estado durante el render (patrón oficial de React para "resetear estado
  // cuando cambia una prop", ver react.dev/learn/you-might-not-need-an-effect)
  // en vez de un useEffect, para no arrastrar el estado de un "Alistar
  // pedido" anterior al siguiente sin una vuelta de render extra.
  const [resetKey, setResetKey] = useState(movimiento?.id ?? null);
  if ((movimiento?.id ?? null) !== resetKey) {
    setResetKey(movimiento?.id ?? null);
    setFiltroCodigo('');
    setFiltroDescripcion('');
    setFiltroEstadoEntrega('todos');
    setSelectedItem(null);
    setSelectedLoteIndex(null);
    setCantidadOverrides({});
    setMostrarConfirmacion(false);
  }

  // Pisa `cantidad` con lo editado (input en línea o EditarLoteModal) sobre
  // el lote crudo del mock -- mismo criterio que ya tenía LotesDisponiblesTable
  // antes de subir el estado acá.
  function mergeLotes(loteList) {
    return loteList.map((l) => (l.loteSerie in cantidadOverrides ? { ...l, cantidad: cantidadOverrides[l.loteSerie] } : l));
  }

  function asignadoDe(articulo) {
    return mergeLotes(articulo.lotes ?? []).reduce((acc, l) => acc + (Number(l.cantidad) || 0), 0);
  }

  const articulosFiltrados = useMemo(() => (movimiento?.articulos ?? []).filter((a) => {
    if (filtroCodigo && !a.codigo.toLowerCase().includes(filtroCodigo.trim().toLowerCase())) return false;
    if (filtroDescripcion && !a.descripcion.toLowerCase().includes(filtroDescripcion.trim().toLowerCase())) return false;
    if (filtroEstadoEntrega !== 'todos' && estadoEntregaDe(a, movimiento?.estado) !== filtroEstadoEntrega) return false;
    return true;
  }), [movimiento, filtroCodigo, filtroDescripcion, filtroEstadoEntrega]);

  // Sin useState/useEffect: mismo patrón "siempre hay algo seleccionado" que
  // effectiveSelectedId en Solicitudes.jsx.
  const effectiveSelected = articulosFiltrados.some((a) => a.item === selectedItem)
    ? articulosFiltrados.find((a) => a.item === selectedItem)
    : (articulosFiltrados[0] ?? null);

  const lotes = mergeLotes(effectiveSelected?.lotes ?? []);

  // La lista de lotes cambia con el ítem elegido arriba -- si la selección de
  // lote quedó fuera de rango (o el ítem cambió), la resetea durante el
  // render en vez de un useEffect (mismo criterio que el reset de arriba).
  const [lastArticuloItem, setLastArticuloItem] = useState(effectiveSelected?.item ?? null);
  if ((effectiveSelected?.item ?? null) !== lastArticuloItem) {
    setLastArticuloItem(effectiveSelected?.item ?? null);
    if (selectedLoteIndex !== null) setSelectedLoteIndex(null);
  }

  // Igual que effectiveSelected de arriba -- por defecto, el primer lote
  // queda seleccionado en vez de dejar la tabla sin selección (encargo
  // explícito).
  const effectiveLoteIndex = selectedLoteIndex !== null && lotes[selectedLoteIndex]
    ? selectedLoteIndex
    : (lotes.length > 0 ? 0 : null);
  const selectedLote = effectiveLoteIndex !== null ? lotes[effectiveLoteIndex] : null;

  const asignadoActual = effectiveSelected ? asignadoDe(effectiveSelected) : 0;
  const asignadoCompleto = !!effectiveSelected && Math.abs(asignadoActual - effectiveSelected.cantidadSolicitada) < 0.001;

  // Confirmar exige que TODOS los ítems del documento (no solo el
  // seleccionado/filtrado) queden con su cantidad esperada completamente
  // repartida entre lotes (encargo explícito) -- sobre `movimiento.articulos`
  // completo, para que un filtro activo no esconda un ítem sin resolver.
  const itemsSinResolver = (movimiento?.articulos ?? [])
    .filter((a) => Math.abs(asignadoDe(a) - a.cantidadSolicitada) > 0.001);
  const puedeConfirmar = movimiento?.estado === 'sin-confirmar' && itemsSinResolver.length === 0;

  // "Sugerir" (encargo explícito: redistribuir por FEFO) -- reparte toda la
  // cantidad esperada de UN ítem entre SUS lotes, priorizando el que vence
  // antes (comparación lexicográfica de 'YYYY-MM-DD', válida sin parsear a
  // Date), respetando el stock de cada uno. Pisa cualquier reparto manual
  // previo de ese ítem -- es un redo completo, no un relleno parcial. Función
  // pura (no toca estado) para poder reusarla tanto en "Sugerir" (un ítem,
  // ver handleSugerirFEFO) como en "Sugerir Todos" (encargo explícito, todos
  // los ítems del documento de una, ver handleSugerirTodos).
  function calcularSugerenciaFEFO(articulo) {
    let restante = articulo.cantidadSolicitada;
    const ordenados = [...(articulo.lotes ?? [])].sort((a, b) => (a.vence < b.vence ? -1 : a.vence > b.vence ? 1 : 0));
    const asignaciones = {};
    ordenados.forEach((l) => {
      const asignar = Math.min(l.stock, Math.max(0, restante));
      asignaciones[l.loteSerie] = asignar;
      restante -= asignar;
    });
    return asignaciones;
  }

  function handleSugerirFEFO() {
    if (!effectiveSelected) return;
    setCantidadOverrides((prev) => ({ ...prev, ...calcularSugerenciaFEFO(effectiveSelected) }));
  }

  // "Sugerir Todos" (encargo explícito) -- réplica del botón que vivía
  // arriba de la tabla principal antes de que "Sugerir" fuera visual-only
  // (ver comentario viejo más abajo, "mig-alistar-filters"); ahora que la
  // lógica FEFO es real, tiene sentido recuperarlo como el equivalente
  // "todos los ítems de una" del Sugerir por fila.
  function handleSugerirTodos() {
    if (!movimiento) return;
    const asignaciones = {};
    movimiento.articulos.forEach((a) => Object.assign(asignaciones, calcularSugerenciaFEFO(a)));
    setCantidadOverrides((prev) => ({ ...prev, ...asignaciones }));
  }

  // El botón "Confirmar" del footer ya no confirma directo (encargo
  // explícito "modal de confirmación con resumen") -- abre
  // ConfirmarAlistamientoModal; el Confirmar real vive en ese modal y
  // dispara handleConfirmarDefinitivo.
  function handleConfirmarDefinitivo() {
    const cantidadesPorItem = movimiento.articulos.map((a) => ({ item: a.item, cantidadEntregada: asignadoDe(a) }));
    onConfirmar(movimiento.id, cantidadesPorItem);
    setMostrarConfirmacion(false);
  }

  if (!movimiento) return null;

  // Solo se arma cuando el modal de confirmación está abierto -- por ítem,
  // esperada/alistada (ya validadas iguales, puedeConfirmar lo exige) y sus
  // lotes con cantidad > 0 (los que quedaron en 0 no aportan al resumen).
  const resumenItems = mostrarConfirmacion ? movimiento.articulos.map((a) => ({
    item: a.item,
    codigo: a.codigo,
    descripcion: a.descripcion,
    esperada: a.cantidadSolicitada,
    alistada: asignadoDe(a),
    lotes: mergeLotes(a.lotes ?? []).filter((l) => (Number(l.cantidad) || 0) > 0),
  })) : [];

  const estadoBadge = ESTADO_BADGE[movimiento.estado];

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-alistar-modal" role="dialog" aria-modal="true" aria-labelledby="mig-alistar-title">
        <ModalHeader
          title="Artículos Genéricos"
          titleId="mig-alistar-title"
          onClose={onClose}
        />

        <div className="modal-body mig-alistar-body">
          <div className="mig-alistar-identity">
            <div className="mig-alistar-icon">
              <LuPackage className="icon" aria-hidden="true" />
            </div>
            <div className="mig-alistar-identity-text">
              <div className="mig-alistar-identity-name">
                {`${movimiento.trns.toUpperCase()} · ${movimiento.consecutivo}`}
                <Badge tone={estadoBadge.tone} className="mig-alistar-badge">{estadoBadge.label}</Badge>
              </div>
              <div className="mig-alistar-identity-sub">{movimiento.solicitante}</div>
            </div>
          </div>

          <div className="mig-articulos-block">
            <div className="mig-articulos-toolbar">
              <span className={`mig-articulos-toolbar-hint${itemsSinResolver.length === 0 ? ' completo' : ''}`}>
                {itemsSinResolver.length === 0
                  ? 'Todos los ítems ya están asignados'
                  : `${itemsSinResolver.length} ${itemsSinResolver.length === 1 ? 'ítem' : 'ítems'} por asignar`}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={LuRefreshCw}
                disabled={movimiento.estado !== 'sin-confirmar'}
                title="Redistribuye por FEFO la cantidad esperada de todos los ítems entre sus lotes"
                onClick={handleSugerirTodos}
              >
                Sugerir Todos
              </Button>
            </div>

            <ArticulosItemsTable
              articulos={articulosFiltrados}
              selectedItem={effectiveSelected?.item ?? null}
              onSelect={setSelectedItem}
              movimientoEstado={movimiento.estado}
            />
          </div>

          <div className="mig-lotes-section">
            <h4 className="mig-lotes-title">
              Artículos disponibles para el código:
              {effectiveSelected && (
                <>
                  <span className="mig-lotes-codigo">{effectiveSelected.codigo}</span>
                  <span className="mig-lotes-descripcion">{effectiveSelected.descripcion}</span>
                  <span className="mig-lotes-esperada">
                    Cnt. Esperada: <strong>{effectiveSelected.cantidadSolicitada.toFixed(2)}</strong>
                  </span>
                  <span className={`mig-lotes-asignado${asignadoCompleto ? ' completo' : ''}`}>
                    Asignado: <strong>{asignadoActual.toFixed(2)}</strong>
                  </span>
                </>
              )}
            </h4>

            <div className="mig-lotes-row">
              <LotesDisponiblesTable
                lotes={lotes}
                selectedIndex={effectiveLoteIndex}
                onSelect={setSelectedLoteIndex}
                onCantidadChange={(loteSerie, value) => setCantidadOverrides((prev) => ({ ...prev, [loteSerie]: value }))}
                onSugerirTodos={handleSugerirFEFO}
              />

              <div className="mig-lotes-summary">
                <div className="mig-summary-title">Resumen de lote</div>
                {!selectedLote && <div className="mig-summary-hint">Selecciona un lote de la tabla para ver su resumen.</div>}
                <div className="mig-summary-row"><span>Id Sede</span><span>{selectedLote?.idSede ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Id.Bdg</span><span>{selectedLote?.bdg ?? '—'}</span></div>
                <div className="mig-summary-row"><span>No.Documento</span><span>{selectedLote?.noDocumento ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Genérico</span><span>{selectedLote?.generico ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Días vence</span><span>{selectedLote?.diasVence ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Lote serie</span><span>{selectedLote?.loteSerie ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Trans.</span><span>{selectedLote?.trans ?? '—'}</span></div>
                <div className="mig-summary-divider" aria-hidden="true" />
                <div className="mig-summary-row mig-summary-total"><span>Id. Artículo</span><span>{selectedLote?.generico ?? '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {movimiento.estado === 'sin-confirmar' && itemsSinResolver.length > 0 && (
            <span className="mig-alistar-confirm-hint">
              Faltan {itemsSinResolver.length} {itemsSinResolver.length === 1 ? 'ítem' : 'ítems'} por asignar entre lotes
            </span>
          )}
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button
            variant="primary"
            icon={LuThumbsUp}
            disabled={!puedeConfirmar}
            title={puedeConfirmar ? undefined : 'Asigná la cantidad esperada de cada ítem entre sus lotes antes de confirmar'}
            onClick={() => setMostrarConfirmacion(true)}
          >
            Confirmar
          </Button>
        </div>
      </div>

      {mostrarConfirmacion && (
        <ConfirmarAlistamientoModal
          movimiento={movimiento}
          resumenItems={resumenItems}
          onClose={() => setMostrarConfirmacion(false)}
          onConfirmar={handleConfirmarDefinitivo}
        />
      )}
    </div>
  );
}
