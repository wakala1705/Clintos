'use client';

import { useEffect, useState } from 'react';
import './ReposicionesCard.css';
import { LuEllipsis, LuEye, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';

// Card maestra de reposiciones: buscador (por consecutivo) + tabla + footer
// con el conteo y la fila seleccionada. El menú "···" de cada fila se
// controla con un solo id (openMenuId) porque solo puede haber uno abierto a
// la vez — se cierra al hacer click fuera de cualquier .row-actions.
export default function ReposicionesCard({ repos, selectedId, onSelect, onNuevo, onVerDetalle, onEditar, onEliminar }) {
  const [query, setQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(e) {
      if (!e.target.closest('.row-actions')) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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
                  <td className="center"><span className={`badge ${rep.estado.cls}`}>{rep.estado.text}</span></td>
                  <td className="center">
                    <div className="row-actions">
                      <span
                        className="icon-action"
                        title="Ver detalle"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); onVerDetalle(rep.id); }}
                      >
                        <LuEye className="icon" aria-hidden="true" />
                      </span>
                      <span
                        className="icon-action"
                        title="Más acciones"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId((id) => (id === rep.id ? null : rep.id)); }}
                      >
                        <LuEllipsis className="icon" aria-hidden="true" />
                      </span>
                      {openMenuId === rep.id && (
                        <div className="row-menu" role="menu">
                          <button
                            type="button"
                            className="row-menu-item"
                            role="menuitem"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEditar(rep.id); }}
                          >
                            <LuPencil className="icon" aria-hidden="true" />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="row-menu-item danger"
                            role="menuitem"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEliminar(rep.id); }}
                          >
                            <LuTrash2 className="icon" aria-hidden="true" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-footer">
        <span className="badge neutral">{repos.length} registro{repos.length === 1 ? '' : 's'}</span>
        <span className="footer-note" style={{ marginLeft: 'auto' }}>
          Reposición seleccionada: <b>{selected ? selected.id : '—'}</b>
        </span>
      </div>
    </section>
  );
}
