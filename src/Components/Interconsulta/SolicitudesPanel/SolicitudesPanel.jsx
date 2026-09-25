'use client';

import { useMemo, useState } from 'react';
import { LuMaximize2, LuMinimize2, LuSearch } from 'react-icons/lu';
import './SolicitudesPanel.css';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import SolicitudesTable from './SolicitudesTable/SolicitudesTable';
import SolicitudesFooter from './SolicitudesFooter/SolicitudesFooter';
import {
  ESTADOS, PAGE_SIZE, VISTAS, VISTA_DESCRIPCION,
} from '@/hooks/Interconsulta/interconsultaData';

// Cabecera de la lista ("Solicitudes · <descripción> · N registros") oculta
// (encargo explícito): el conteo ya está en el footer de la tabla. El bloque
// sigue intacto — poner en true para volver a mostrarlo.
const MOSTRAR_CABECERA_LISTA = false;

// Card de la bandeja. Barra de una sola fila (AGENTS.md "Barra de filtros de
// listado"): buscador a la izquierda, .filter-spacer, tabs de vista
// (Por nombre / Por especialidad) y el filtro de estado. Debajo, la tabla y el
// footer con el total y la paginación.
//
// Al extremo derecho de la barra, el botón expandir/contraer (`expandida`,
// controlado desde el padre porque también compacta la fila de KPIs, ver
// Interconsulta.jsx): le da más alto a la tabla.
export default function SolicitudesPanel({
  solicitudes, onAbrir, expandida, onToggleExpandida,
}) {
  const [vista, setVista] = useState('nombre');
  const [estado, setEstado] = useState('pendientes');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const ExpandIcon = expandida ? LuMinimize2 : LuMaximize2;

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return solicitudes.filter((s) => {
      if (s.asignacion !== vista) return false;
      if (estado !== 'todas' && s.estado !== estado) return false;
      if (!q) return true;
      return s.paciente.toLowerCase().includes(q)
        || s.documento.toLowerCase().includes(q)
        || s.id.toLowerCase().includes(q);
    });
  }, [solicitudes, vista, estado, query]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const pageActual = Math.min(page, totalPages);
  const visibles = filtradas.slice((pageActual - 1) * PAGE_SIZE, pageActual * PAGE_SIZE);

  // Cualquier cambio de filtro vuelve a la primera página.
  function conReset(setter) {
    return (v) => { setter(v); setPage(1); };
  }

  return (
    <section className="card ic-panel">
      <div className="filter-bar ic-toolbar">
        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar por paciente, documento o número..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            aria-label="Buscar por paciente, documento o número"
          />
        </div>

        <div className="filter-spacer" />

        <SegmentedFilterBar
          options={VISTAS}
          value={vista}
          onChange={conReset(setVista)}
          ariaLabel="Ver interconsultas por nombre o por especialidad"
        />

        <div className="ic-estado-filter">
          <label htmlFor="ic-estado" className="ic-estado-label">Estado:</label>
          <FormSelect
            id="ic-estado"
            value={estado}
            onChange={conReset(setEstado)}
            options={ESTADOS}
          />
        </div>

        <button
          type="button"
          className="ic-expand-btn"
          onClick={onToggleExpandida}
          aria-pressed={expandida}
          aria-label={expandida ? 'Contraer tabla' : 'Expandir tabla'}
          title={expandida ? 'Contraer tabla' : 'Expandir tabla'}
        >
          <ExpandIcon className="icon" aria-hidden="true" />
        </button>
      </div>

      {MOSTRAR_CABECERA_LISTA && (
        <div className="ic-list-head">
          <h2>Solicitudes</h2>
          <span className="ic-list-sub">{VISTA_DESCRIPCION[vista]}</span>
          <Badge tone="neutral" className="ic-list-count">
            {filtradas.length} {filtradas.length === 1 ? 'registro' : 'registros'}
          </Badge>
        </div>
      )}

      <SolicitudesTable solicitudes={visibles} onAbrir={onAbrir} />

      <SolicitudesFooter
        total={filtradas.length}
        page={pageActual}
        totalPages={totalPages}
        onChangePage={setPage}
      />
    </section>
  );
}
