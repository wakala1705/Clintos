'use client';

import { useMemo, useState } from 'react';
import './OrdenesPanel.css';
import AgendaEmptyState from '../../../AgendaEmptyState/AgendaEmptyState';
import Button from '@/Components/Button/Button';
import {
  LuCheck, LuChevronRight, LuClipboardList, LuListFilter, LuPencil, LuPrinter,
} from 'react-icons/lu';

const FILTROS = [
  { value: 'todas', label: 'Todas las órdenes' },
  { value: 'mias', label: 'Mis órdenes' },
];

// Columna izquierda de la pestaña Órdenes médicas: CTA "Iniciar nueva
// orden", filtro (Todas / Mis órdenes) y lista plana de órdenes — a
// diferencia de RegistrosPanel, acá no hay grupos por tipo. La orden
// seleccionada muestra los botones imprimir/editar (mismo patrón que
// .rg-subrow-actions). "Mis órdenes" compara `autor` con `usuarioActual` sin
// distinguir mayúsculas (los autores vienen en mayúsculas, como en el legado).
export default function OrdenesPanel({
  ordenes,
  usuarioActual,
  onNuevaOrden,
  selectedOrdenId,
  onSelectOrden,
}) {
  const [filtro, setFiltro] = useState('todas');
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const visibles = useMemo(() => {
    if (filtro !== 'mias') return ordenes;
    const yo = usuarioActual?.toLowerCase();
    return ordenes.filter((o) => o.autor?.toLowerCase() === yo);
  }, [ordenes, filtro, usuarioActual]);

  return (
    <div className="om-panel">
      <div className="om-top">
        <Button className="om-nueva-orden-btn" onClick={onNuevaOrden}>
          Iniciar nueva orden
        </Button>
      </div>

      {/* Mismo bloque que el header de RegistrosPanel (botón de filtro a la
          izquierda + título que colapsa el panel + chevron), con las mismas
          medidas — ver .rg-header* en RegistrosPanel.css. */}
      <div className="om-header">
        <div className="om-header-row">
          {!panelCollapsed && (
            <button
              type="button"
              className={`om-filter-btn${filtro !== 'todas' ? ' active' : ''}`}
              onClick={() => setFiltroAbierto((v) => !v)}
              aria-expanded={filtroAbierto}
              aria-label="Filtrar órdenes"
              title="Filtrar órdenes"
            >
              <LuListFilter className="icon" />
            </button>
          )}
          <button
            type="button"
            className="om-header-btn"
            onClick={() => setPanelCollapsed((v) => !v)}
            aria-expanded={!panelCollapsed}
          >
            <span className="om-header-title">{FILTROS.find((f) => f.value === filtro).label}</span>
            <LuChevronRight className={`icon om-header-chevron${panelCollapsed ? '' : ' open'}`} />
          </button>
        </div>

        {!panelCollapsed && filtroAbierto && (
          <div className="om-filter-options" role="group" aria-label="Filtro de órdenes">
            {FILTROS.map((opcion) => (
              <button
                type="button"
                key={opcion.value}
                className={`om-filter-option${filtro === opcion.value ? ' selected' : ''}`}
                aria-pressed={filtro === opcion.value}
                onClick={() => { setFiltro(opcion.value); setFiltroAbierto(false); }}
              >
                {opcion.label}
                {filtro === opcion.value && <LuCheck className="icon" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {!panelCollapsed && (visibles.length === 0 ? (
        <AgendaEmptyState icon={LuClipboardList} title="Sin órdenes" compact />
      ) : (
        <div className="om-list">
          {visibles.map((orden) => {
            const isSelected = selectedOrdenId === orden.id;
            return (
              <div key={orden.id} className={`om-item${isSelected ? ' selected' : ''}`}>
                <button
                  type="button"
                  className="om-item-main"
                  onClick={() => onSelectOrden(orden)}
                  aria-pressed={isSelected}
                >
                  <span className="om-item-head">
                    <span className="om-item-datetime">{orden.fecha} - {orden.hora}</span>
                    <span className="om-item-numero">{orden.numero}</span>
                  </span>
                  <span className="om-item-title">{orden.tituloNota}</span>
                  <span className="om-item-author">{orden.autor}</span>
                  <span className="om-item-meta">
                    <span>{orden.especialidad}</span>
                    {orden.ambito && <span>{orden.ambito}</span>}
                  </span>
                </button>

                {isSelected && (
                  <div className="om-item-actions">
                    <button type="button" className="om-item-action-btn" aria-label={`Imprimir orden ${orden.numero}`} title="Imprimir">
                      <LuPrinter className="icon" />
                    </button>
                    <button type="button" className="om-item-action-btn" aria-label={`Editar orden ${orden.numero}`} title="Editar">
                      <LuPencil className="icon" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
