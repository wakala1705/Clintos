'use client';

import { useState } from 'react';
import './ReposicionesCard.css';
import Badge from '@/Components/Badge/Badge';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuEye, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';

// Card maestra de reposiciones: buscador (por consecutivo) + tabla + footer
// con el conteo y la fila seleccionada. El menú "⋯" de cada fila es
// @/Components/DropdownMenu (ver AGENTS.md "Dropdowns").
export default function ReposicionesCard({ repos, selectedId, onSelect, onNuevo, onVerDetalle, onEditar, onEliminar }) {
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const filtered = term ? repos.filter((r) => r.id.toLowerCase().includes(term)) : repos;
  const selected = repos.find((r) => r.id === selectedId);

  return (
    <section className="card">
      <div className="card-toolbar">
        <div className="search-field">
          <LuSearch className="icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por consecutivo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-primary" onClick={onNuevo}>
            <LuPlus className="icon" aria-hidden="true" />
            Nuevo
          </button>
        </div>
      </div>

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="small-empty">
            <LuSearch className="icon" aria-hidden="true" />
            <span>No se encontraron reposiciones para tu búsqueda.</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Bodega que pide</th>
                <th>Bodega que despacha</th>
                <th>CNS movimiento</th>
                <th>Procedencia</th>
                <th>Usuario</th>
                <th>Fecha confirmación</th>
                <th className="center" style={{ width: 140 }}>Estado</th>
                <th className="center" style={{ width: 96 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rep) => (
                <tr
                  key={rep.id}
                  className={rep.id === selectedId ? 'selected' : ''}
                  onClick={() => onSelect(rep.id)}
                >
                  <td className="strong">{rep.id}</td>
                  <td>{rep.bodega}</td>
                  <td>{rep.bodegaDespacha}</td>
                  <td>{rep.cns}</td>
                  <td>{rep.procedencia}</td>
                  <td>{rep.usuario}</td>
                  <td>{rep.fecha}</td>
                  <td className="center"><Badge tone={rep.estado.cls}>{rep.estado.text}</Badge></td>
                  <td className="center">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-action"
                        title="Ver detalle"
                        aria-label={`Ver detalle de la reposición ${rep.id}`}
                        onClick={(e) => { e.stopPropagation(); onVerDetalle(rep.id); }}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <LuEye className="icon" aria-hidden="true" />
                      </button>
                      <DropdownMenu
                        label={`Más acciones para la reposición ${rep.id}`}
                        items={[
                          { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: () => onEditar(rep.id) },
                          {
                            id: 'eliminar', label: 'Eliminar', icon: LuTrash2, tone: 'danger', onSelect: () => onEliminar(rep.id),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-footer">
        <Badge tone="neutral">{repos.length} registro{repos.length === 1 ? '' : 's'}</Badge>
        <span className="footer-note" style={{ marginLeft: 'auto' }}>
          Reposición seleccionada: <b>{selected ? selected.id : '—'}</b>
        </span>
      </div>
    </section>
  );
}
