'use client';

import { useEffect, useMemo, useState } from 'react';
import './BedBoardModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import BedCard from '@/Components/GestionCamas/BedCard/BedCard';
import BedActionsMenu from '@/Components/GestionCamas/BedActionsMenu/BedActionsMenu';
import EstadoCamaBadge from '@/Components/GestionCamas/EstadoCamaBadge/EstadoCamaBadge';
import ViewToggle from '@/Components/GestionCamas/ViewToggle/ViewToggle';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import BedDetailModal from './BedDetailModal/BedDetailModal';
import { CAMAS_PISO } from '@/hooks/GestionEnfermeria/mockBedBoardData';
import { AREAS_OPERATIVAS, sectorDeCama } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { CTA_PRINCIPAL } from '@/hooks/GestionCamas/mockCamasData';
import { cardHue, CLINICAL_STATUS_GROUPS, CLINICAL_STATUS_LABEL } from '@/hooks/GestionCamas/bedContextFormat';
import { LuGrid2X2 } from 'react-icons/lu';

const FILTROS_ESTADO = [
  { value: 'todos', label: 'Todos' },
  { value: 'ocupada', label: 'Ocupadas' },
  { value: 'libre', label: 'Disponibles' },
];

// Sector norte/sur -> label ("Sector norte"/"Sector sur"), derivado de
// AREAS_OPERATIVAS (misma fuente que el selector de área de Panel General)
// sin la opción "Todo el área" — solo lo usa BedListView para la columna
// "Sector" de la vista Lista.
const SECTOR_LABEL = Object.fromEntries(
  AREAS_OPERATIVAS.filter((a) => a.value !== 'todo').map((a) => [a.value, a.label]),
);

// Vista "Lista" (encargo: selector Tarjetas/Lista) — tabla propia en vez de
// reusar BedTable de Gestión de Camas tal cual: esa tabla tiene columnas
// Sede/Área/Piso/Sector/Tipo que este mock más simple (CAMAS_PISO) no
// modela, así que reusar BedTable dejaría 5 columnas en blanco. Mismo
// patrón que BloqueContextual en BedCard.jsx: sub-componente local no
// exportado, solo para este archivo.
function BedListView({ camas, onAction }) {
  return (
    <div className="bb-table-outer">
      <div className="data-table-wrap">
        <table className="data-table bb-table">
          <thead>
            <tr>
              <th>Cama</th>
              <th>Sector</th>
              <th>Estado</th>
              <th>Paciente</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {camas.map((c) => {
              const cta = CTA_PRINCIPAL[c.estado];
              return (
                <tr key={c.id}>
                  <td className="cell-primary">{c.numero}</td>
                  <td className="cell-muted">{SECTOR_LABEL[sectorDeCama(c.numero)] ?? '—'}</td>
                  <td><EstadoCamaBadge estado={c.estado} /></td>
                  <td>
                    {c.paciente ? (
                      <>
                        {c.paciente.nombre}
                        <span className="cell-sub">{c.paciente.hc}</span>
                      </>
                    ) : <span className="cell-muted">—</span>}
                  </td>
                  <td className="col-acciones">
                    <div className="bb-table-actions">
                      {/* Aislamiento/Inactiva no tienen CTA_PRINCIPAL (mockCamasData.js) */}
                      {cta && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onAction(cta.action, c.id)}>
                          {cta.label}
                        </button>
                      )}
                      <BedActionsMenu estado={c.estado} numero={c.numero} onAction={(action) => onAction(action, c.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Mapa de camas del piso (encargo: "reutiliza las mismas card de gestión de
// camas" — mismo BedCard/EstadoCamaBadge/BedActionsMenu/InfoLine/ViewToggle
// que Gestión de Camas, sin reescribirlos) — modal casi a pantalla completa
// (90vw × 90vh fijo, ver .bb-modal-card en BedBoardModal.css) montado desde
// el botón "Mapa de camas" de PatientsPanel.jsx. `areaOperativa` (el área ya
// elegida en Panel General) solo sirve de valor inicial del selector propio
// del modal — una vez abierto, el usuario puede cambiar de área sin que eso
// afecte el filtro del panel de atrás.
export default function BedBoardModal({ areaOperativa, onClose, onOpenAtencion }) {
  const [areaFiltro, setAreaFiltro] = useState(areaOperativa);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [vista, setVista] = useState('tarjetas');
  const [detalleCamaId, setDetalleCamaId] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const camasArea = useMemo(() => (
    areaFiltro === 'todo' ? CAMAS_PISO : CAMAS_PISO.filter((c) => sectorDeCama(c.numero) === areaFiltro)
  ), [areaFiltro]);

  // Conteos/indicadores del footer sobre `camasArea` (nunca sobre el
  // resultado ya filtrado por estado) — para que "Total de camas"/"% de
  // ocupación" sigan reflejando el área elegida sin importar qué segmento
  // (Todos/Ocupadas/Disponibles) esté activo arriba.
  const counts = useMemo(() => ({
    todos: camasArea.length,
    ocupada: camasArea.filter((c) => c.estado === 'ocupada').length,
    libre: camasArea.filter((c) => c.estado === 'libre').length,
  }), [camasArea]);

  const ocupacionPct = counts.todos ? Math.round((counts.ocupada / counts.todos) * 100) : 0;

  const filtroOptions = useMemo(() => FILTROS_ESTADO.map((f) => ({ ...f, count: counts[f.value] })), [counts]);

  const camas = useMemo(() => (
    estadoFiltro === 'todos' ? camasArea : camasArea.filter((c) => c.estado === estadoFiltro)
  ), [camasArea, estadoFiltro]);

  // `cardHue` (bedContextFormat.js) es la misma función que ya usa BedCard
  // para pintar cada tarjeta — reusarla acá garantiza que la leyenda nunca
  // se desincronice de los colores que realmente se ven en la grilla (p.ej.
  // si algún día `camasArea` trae un paciente sin género/edad, "unknown"
  // aparece en los 2 lugares o en ninguno, nunca solo en uno). Grupos fijos
  // (CLINICAL_STATUS_GROUPS), filtrados a las claves realmente presentes —
  // mismo criterio que antes ("nunca los 8 completos si este mock no los
  // modela todos").
  const clavesPresentes = useMemo(() => new Set(camasArea.map(cardHue)), [camasArea]);
  const legendGroups = useMemo(() => CLINICAL_STATUS_GROUPS
    .map((grupo) => ({ ...grupo, claves: grupo.claves.filter((c) => clavesPresentes.has(c)) }))
    .filter((grupo) => grupo.claves.length > 0), [clavesPresentes]);

  // BedCard usa `now` solo para el estado "limpieza" (ninguna cama de este
  // mock lo tiene) — inicializador perezoso de useState, para no leer
  // Date.now() en el cuerpo del componente (impuro en cada render).
  const [now] = useState(() => Date.now());

  // "Ver detalle" (CTA_PRINCIPAL/BedActionsMenu, mockCamasData.js) abre el
  // mismo BedDetailModal que la tarjeta al clickearla (encargo: "al
  // accionar la card... abrir un modal con el detalle") — mismo destino sin
  // importar si el gesto fue click en la tarjeta o "Ver detalle" del ⋯,
  // para no dejar 2 caminos con resultados distintos. El resto de acciones
  // de CTA_PRINCIPAL/BedActionsMenu (Trasladar, Cambiar estado...) no
  // tienen flujo propio en Enfermería todavía — mismo aviso "en desarrollo"
  // que el resto de acciones sin pantalla propia en este módulo.
  function handleAction(action, camaId) {
    if (action === 'ver-detalle') {
      setDetalleCamaId(camaId);
      return;
    }
    window.ncToast?.('Esta acción está en desarrollo.');
  }

  const camaDetalle = detalleCamaId ? CAMAS_PISO.find((c) => c.id === detalleCamaId) : null;

  // BedDetailModal se renderiza como hermano del overlay de este modal, no
  // anidado dentro de él: ambos son full-viewport (.modal-overlay) con su
  // propio onClick de backdrop, y anidarlos dejaría que un click en el
  // backdrop del detalle burbujee hasta el onClick del overlay del tablero
  // y cierre los 2 de un solo click en vez de solo el de encima.
  return (
    <>
      <div className="modal-overlay open" role="presentation" onClick={onClose}>
        <div
          className="modal-card bb-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bed-board-title"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader
            icon={LuGrid2X2}
            tone="primary"
            title="Mapa de camas"
            titleId="bed-board-title"
            onClose={onClose}
          />

          <div className="filter-bar">
            <SegmentedFilterBar
              options={filtroOptions}
              value={estadoFiltro}
              onChange={setEstadoFiltro}
              ariaLabel="Filtrar camas por estado"
            />
            <div className="filter-spacer" />
            <AreaSelector options={AREAS_OPERATIVAS} value={areaFiltro} onChange={setAreaFiltro} label="Área" />
            <ViewToggle view={vista} onChange={setVista} />
          </div>

          <div className="modal-body bb-modal-body">
            {camas.length === 0 ? (
              <div className="cb-empty-state">No hay camas para esta área.</div>
            ) : vista === 'tabla' ? (
              <BedListView camas={camas} onAction={handleAction} />
            ) : (
              <div className="cb-grid">
                {camas.map((cama) => (
                  <BedCard
                    key={cama.id}
                    cama={cama}
                    onAction={handleAction}
                    etaTimestamp={null}
                    now={now}
                    onOpenDetail={setDetalleCamaId}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="legend-bar bb-footer">
            <div className="bb-footer-stats">
              <span>Total de camas: <b>{counts.todos}</b></span>
              <span>Camas ocupadas: <b>{counts.ocupada}</b></span>
              <span>Camas disponibles: <b>{counts.libre}</b></span>
              <span>% de ocupación: <b>{ocupacionPct}%</b></span>
            </div>
            <div className="bb-legend">
              {legendGroups.map((grupo) => (
                <div className="bb-legend-group" key={grupo.label}>
                  <span className="bb-legend-label">{grupo.label}:</span>
                  {grupo.claves.map((clave) => (
                    <span className="bb-legend-item" key={clave}>
                      <span className={`bb-legend-dot bb-legend-dot-${clave}`} />
                      {CLINICAL_STATUS_LABEL[clave]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {camaDetalle && (
        <BedDetailModal
          cama={camaDetalle}
          onClose={() => setDetalleCamaId(null)}
          onAction={handleAction}
          onOpenAtencion={onOpenAtencion}
        />
      )}
    </>
  );
}
