'use client';

import { useMemo, useState } from 'react';
import './RegistrosPanel.css';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuCheck, LuChevronRight, LuFolderOpen, LuListFilter, LuPencil, LuPlus, LuPrinter } from 'react-icons/lu';

const FILTROS = [
  { value: 'mias', label: 'Hechas por mí' },
  { value: 'todas', label: 'Todas las historias clínicas' },
];

// true = varios grupos pueden quedar expandidos a la vez; false = acordeón
// (expandir uno colapsa los demás). Constante a propósito, no prop — así
// alternar el comportamiento es un cambio de una línea (ver prompt de esta
// pantalla).
const ALLOW_MULTIPLE_EXPANDED_GROUPS = false;

// Última línea de cada registro: "ESPECIALIDAD - CÓDIGO PLANTILLA" (ej.
// "HEMATO-ONCOLOGÍA - HIC"). Si el registro no trae ninguno de los dos
// (dato viejo), cae al rol del autor.
function metaRegistro(registro) {
  return [registro.especialidad, registro.plantilla].filter(Boolean).join(' - ') || registro.rol;
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// '17.ABR.2026' + '08:35 AM' → timestamp, solo para ordenar la lista plana
// de registros del más reciente al más antiguo.
function timestampRegistro({ fecha, hora }) {
  const [dia, mes, anio] = fecha.split('.');
  const [hhmm, meridiano] = hora.split(' ');
  let [h, m] = hhmm.split(':').map(Number);
  if (meridiano === 'PM' && h < 12) h += 12;
  if (meridiano === 'AM' && h === 12) h = 0;
  return new Date(Number(anio), MESES.indexOf(mes), Number(dia), h, m).getTime();
}

// Panel de Registros con dos vistas, que alterna el botón del header (título
// = filtro activo + chevron):
//  - Agrupada (chevron hacia la derecha, vista por defecto): un renglón por
//    tipo (EVO, NOTAS DE ENFERMERÍA...) con su contador; al abrir un grupo se
//    ven sus registros.
//  - Lista plana (chevron hacia abajo): todos los registros sin agrupar, del
//    más reciente al más antiguo — el tipo ya va en la última línea de cada
//    card.
export default function RegistrosPanel({
  grupos,
  nuevaAtencionLabel = 'Nueva atención',
  onNuevaAtencion,
  selectedRegistroId,
  onSelectRegistro,
  usuarioActual,
}) {
  const [vistaPlana, setVistaPlana] = useState(false);
  const [expandedTipos, setExpandedTipos] = useState(() => new Set());
  const [filtro, setFiltro] = useState('todas');
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  // "Hechas por mí" recorta cada grupo a los registros cuyo autor es el
  // usuario actual y oculta los grupos que queden vacíos (el contador de
  // cada grupo refleja lo filtrado, no el total). Sin distinguir mayúsculas:
  // los autores del mock vienen en mayúsculas, como en el sistema legado.
  const gruposVisibles = useMemo(() => {
    if (filtro !== 'mias') return grupos;
    const yo = usuarioActual?.toLowerCase();
    return grupos
      .map((g) => ({ ...g, registros: g.registros.filter((r) => r.autor?.toLowerCase() === yo) }))
      .filter((g) => g.registros.length > 0);
  }, [grupos, filtro, usuarioActual]);

  const registrosPlanos = useMemo(
    () => gruposVisibles.flatMap((g) => g.registros).sort((a, b) => timestampRegistro(b) - timestampRegistro(a)),
    [gruposVisibles],
  );

  function toggleGroup(tipo) {
    setExpandedTipos((prev) => {
      const isOpen = prev.has(tipo);
      if (ALLOW_MULTIPLE_EXPANDED_GROUPS) {
        const next = new Set(prev);
        if (isOpen) next.delete(tipo); else next.add(tipo);
        return next;
      }
      return isOpen ? new Set() : new Set([tipo]);
    });
  }

  // Card de un registro, igual en ambas vistas. Wrapper div (no <button>)
  // para poder alojar los botones imprimir/editar sin anidar botones.
  function renderRegistro(registro) {
    const isSelected = selectedRegistroId === registro.id;
    return (
      <div key={registro.id} className={`rg-subrow${isSelected ? ' selected' : ''}`}>
        <button
          type="button"
          className="rg-subrow-main"
          onClick={() => onSelectRegistro(registro)}
          aria-selected={isSelected}
        >
          <span className="rg-subrow-head">
            <span className="rg-subrow-datetime">{registro.fecha} · {registro.hora}</span>
            {registro.numero && <span className="rg-subrow-numero">{registro.numero}</span>}
          </span>
          <span className="rg-subrow-title">{registro.tituloNota}</span>
          <span className="rg-subrow-author">{registro.autor}</span>
          <span className="rg-subrow-meta">
            <span className="rg-subrow-role">{metaRegistro(registro)}</span>
            {registro.ambito && <span className="rg-subrow-ambito">{registro.ambito}</span>}
          </span>
        </button>

        {isSelected && (
          <div className="rg-subrow-actions">
            <button
              type="button"
              className="rg-subrow-action-btn"
              aria-label={`Imprimir ${registro.tituloNota}`}
              title="Imprimir"
              onClick={registro.archivoUrl ? () => window.open(registro.archivoUrl, '_blank') : undefined}
            >
              <LuPrinter className="icon" />
            </button>
            <button type="button" className="rg-subrow-action-btn" aria-label={`Editar ${registro.tituloNota}`} title="Editar">
              <LuPencil className="icon" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rg-panel">
      <div className="rg-top">
        <button
          type="button"
          className="btn btn-primary rg-nueva-atencion-btn"
          onClick={onNuevaAtencion}
          title={`${nuevaAtencionLabel} (+)`}
        >
          <span className="rg-nueva-atencion-label">
            <LuPlus className="icon" />
            {nuevaAtencionLabel}
          </span>
          <span className="rg-shortcut-hint" aria-hidden="true">+</span>
        </button>
      </div>

      <div className="rg-header">
        <div className="rg-header-row">
          <button
            type="button"
            className={`rg-filter-btn${filtro !== 'todas' ? ' active' : ''}`}
            onClick={() => setFiltroAbierto((v) => !v)}
            aria-expanded={filtroAbierto}
            aria-label="Filtrar registros"
            title="Filtrar registros"
          >
            <LuListFilter className="icon" />
          </button>
          <button
            type="button"
            className="rg-header-btn"
            onClick={() => setVistaPlana((v) => !v)}
            aria-expanded={vistaPlana}
            title={vistaPlana ? 'Ver agrupados' : 'Ver todos los registros'}
          >
            <span className="rg-header-title">{FILTROS.find((f) => f.value === filtro).label}</span>
            <LuChevronRight className={`icon rg-header-chevron${vistaPlana ? ' open' : ''}`} />
          </button>
        </div>

        {filtroAbierto && (
          <div className="rg-filter-options" role="group" aria-label="Filtro de registros">
            {FILTROS.map((opcion) => (
              <button
                type="button"
                key={opcion.value}
                className={`rg-filter-option${filtro === opcion.value ? ' selected' : ''}`}
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

      {/* rg-top/rg-header quedan fijos (encargo explícito): solo este
          wrapper hace scroll, no todo .rg-panel. */}
      <div className="rg-list">
        {gruposVisibles.length === 0 ? (
          <AgendaEmptyState icon={LuFolderOpen} title="Sin registros" compact />
        ) : vistaPlana ? (
          <div className="rg-subrows plana">
            {registrosPlanos.map(renderRegistro)}
          </div>
        ) : (
          <div className="rg-groups">
            {gruposVisibles.map((grupo) => {
              const isOpen = expandedTipos.has(grupo.tipo);
              return (
                <div className="rg-group" key={grupo.tipo}>
                  <div className={`rg-group-row${isOpen ? ' expanded' : ''}`}>
                    <button
                      type="button"
                      className="rg-group-row-btn"
                      onClick={() => toggleGroup(grupo.tipo)}
                      aria-expanded={isOpen}
                    >
                      <LuChevronRight className={`icon rg-group-chevron${isOpen ? ' open' : ''}`} />
                      <span className="rg-group-count">{grupo.registros.length}</span>
                      <span className="rg-group-name">{grupo.tipo}</span>
                      {grupo.estado && <span className="rg-badge-activa">{grupo.estado}</span>}
                    </button>
                    <div className="rg-group-actions">
                      {/* Imprimir del agrupador: solo EVO lo trae (encargo
                          explícito) — el resto de tipos queda solo con "+". */}
                      {grupo.tipo === 'EVO' && (
                        <button type="button" className="rg-group-action-btn" aria-label={`Imprimir ${grupo.tipo}`} title="Imprimir">
                          <LuPrinter className="icon" />
                        </button>
                      )}
                      <button type="button" className="rg-group-action-btn" aria-label={`Agregar registro de ${grupo.tipo}`} title="Agregar">
                        <LuPlus className="icon" />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="rg-subrows">
                      {grupo.registros.map(renderRegistro)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
