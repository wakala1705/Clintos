'use client';

import { useState } from 'react';
import './SeleccionarProgramacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  BUSCAR_POR_OPTIONS, ESTADO_PROGRAMACION_LABEL, ESTADO_PROGRAMACION_OPTIONS, PROGRAMACIONES, duracionLabel,
} from '@/hooks/Admisiones/mockProgramacionesCirugiaData';
import { LuSearch, LuX } from 'react-icons/lu';

// Tono del <Badge> por estado de la programación.
const ESTADO_TONE = {
  programada: 'info',
  urgencia: 'danger',
  realizada: 'success',
  cancelada: 'neutral',
  incumplida: 'warn',
};

// Columnas de la tabla: `key` es el campo del registro (ver PROGRAMACIONES),
// `render` opcional para las que no se muestran tal cual. Las de la derecha
// quedan fuera de vista y se alcanzan con el scroll horizontal de la tabla.
const COLUMNS = [
  { key: 'numero', label: 'Nº Prog.', className: 'spm-num-prog' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'horaInicio', label: 'Hora inicio' },
  { key: 'horaFin', label: 'Hora fin' },
  { key: 'duracionMin', label: 'Duración', render: (p) => duracionLabel(p.duracionMin) },
  { key: 'estado', label: 'Estado' },
  { key: 'identificacion', label: 'Identificación' },
  { key: 'paciente', label: 'Paciente' },
  { key: 'cirujano', label: 'Cirujano / Médico' },
  { key: 'procedimiento', label: 'Procedimiento / Servicio' },
  { key: 'sala', label: 'Sala' },
  { key: 'dxIngreso', label: 'Dx ingreso' },
  { key: 'asa', label: 'ASA' },
  { key: 'clase', label: 'Clase' },
  { key: 'tipoAnestesia', label: 'Tipo anestesia' },
  { key: 'complejidad', label: 'Complejidad' },
];

// Modal "Seleccionar Programación de Cirugía" disparado por el botón "Traer
// de Prog." del panel "Programación Sala Cirugía" de la pestaña Cirugías de
// CargosModal (ver CirugiaPanel en CargosModal.jsx) — lista las
// programaciones de cirugía filtrables por campo/texto y estado, con una
// fila seleccionable (click, Enter/Espacio o doble click para traerla).
// Mock estático (ver mockProgramacionesCirugiaData.js), mismo patrón anidado
// que ProgramacionCirugiaModal: sin backend, "Traer programación" entrega la
// fila elegida a `onTraer` (hoy el padre solo cierra el modal). El texto de
// búsqueda no filtra mientras se escribe: se aplica al disparar la búsqueda
// (botón de lupa integrado a la barra, o Enter) — `draftQuery` es lo escrito
// y `query` lo aplicado. El filtro de estado sí es inmediato.
export default function SeleccionarProgramacionModal({ onClose, onTraer }) {
  const [buscarPor, setBuscarPor] = useState('identificacion');
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [estado, setEstado] = useState('todos');
  const [selectedId, setSelectedId] = useState(PROGRAMACIONES[0].numero);

  const q = query.trim().toLowerCase();
  const rows = PROGRAMACIONES.filter((p) => (
    (estado === 'todos' || p.estado === estado)
    && (!q || String(p[buscarPor]).toLowerCase().includes(q))
  ));
  // La selección solo cuenta mientras la fila siga visible con el filtro
  // actual — si un filtro la oculta, "Traer programación" se deshabilita.
  const seleccionada = rows.find((p) => p.numero === selectedId) ?? null;

  function handleSearch(e) {
    e.preventDefault();
    setQuery(draftQuery);
  }
  function handleClear() {
    setDraftQuery('');
    setQuery('');
  }

  function handleKeyDown(e, numero) {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedId(numero);
    }
  }

  function renderCell(p, col) {
    if (col.key === 'estado') {
      return <Badge tone={ESTADO_TONE[p.estado]}>{ESTADO_PROGRAMACION_LABEL[p.estado]}</Badge>;
    }
    return col.render ? col.render(p) : p[col.key];
  }

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal spm-modal" role="dialog" aria-modal="true" aria-labelledby="spm-modal-title">
        <ModalHeader
          title="Seleccionar Programación de Cirugía"
          titleId="spm-modal-title"
          onClose={onClose}
          trailing={<Badge tone="neutral">Cirugía</Badge>}
        />

        <div className="adm-modal-body spm-body">
          <div className="spm-toolbar">
            <div className="spm-control">
              <label htmlFor="spm-buscar-por" className="spm-label">Buscar por:</label>
              <div className="spm-buscar-select">
                <FormSelect
                  id="spm-buscar-por"
                  value={buscarPor}
                  onChange={setBuscarPor}
                  options={BUSCAR_POR_OPTIONS}
                />
              </div>
            </div>

            <form className="spm-search" role="search" onSubmit={handleSearch}>
              <input
                type="text"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Buscar"
                aria-label="Texto a buscar"
                autoFocus
              />
              {draftQuery && (
                <button type="button" className="spm-clear-btn" onClick={handleClear} aria-label="Limpiar búsqueda" title="Limpiar búsqueda">
                  <LuX className="icon" aria-hidden="true" />
                </button>
              )}
              <button type="submit" className="spm-search-btn" aria-label="Buscar" title="Buscar">
                <LuSearch className="icon" aria-hidden="true" />
              </button>
            </form>

            <div className="spm-control">
              <label htmlFor="spm-estado" className="spm-label">Estado:</label>
              <div className="spm-estado-select">
                <FormSelect
                  id="spm-estado"
                  value={estado}
                  onChange={setEstado}
                  options={ESTADO_PROGRAMACION_OPTIONS}
                />
              </div>
            </div>
          </div>

          <div className="spm-table-card">
            <div className="spm-table-scroll">
              <table className="spm-table">
                <thead>
                  <tr>
                    {COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((p) => (
                    <tr
                      key={p.numero}
                      className={p.numero === selectedId ? 'selected' : undefined}
                      aria-selected={p.numero === selectedId}
                      tabIndex={0}
                      onClick={() => setSelectedId(p.numero)}
                      onDoubleClick={() => onTraer(p)}
                      onKeyDown={(e) => handleKeyDown(e, p.numero)}
                    >
                      {COLUMNS.map((col) => <td key={col.key} className={col.className}>{renderCell(p, col)}</td>)}
                    </tr>
                  )) : (
                    <tr className="spm-empty-row">
                      <td colSpan={COLUMNS.length}>No se encontraron programaciones con esos criterios.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Metadata del resultado (conteo) al pie de la tabla. */}
            <div className="spm-table-footer">
              <Badge tone="info">
                {rows.length} {rows.length === 1 ? 'programación' : 'programaciones'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={!seleccionada} onClick={() => onTraer(seleccionada)}>Traer programación</Button>
        </div>
      </div>
    </div>
  );
}
