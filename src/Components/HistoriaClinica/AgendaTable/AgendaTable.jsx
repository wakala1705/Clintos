import { useState } from 'react';
import './AgendaTable.css';
import TipoBadge from '../TipoBadge/TipoBadge';
import { LuChevronRight } from 'react-icons/lu';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset — se
// renderizan ambas y la CSS decide cuál mostrar según el ancho (mismo patrón
// que PatientsTable, ver AGENTS.md), así que no hay dos fuentes de verdad
// para las mismas filas. Un clic selecciona (resalta) la fila/tarjeta; doble
// clic en una fila/tarjeta abre la atención de ese paciente (onOpenAtencion)
// — mismo patrón clic-selecciona/doble-clic-elige que las filas de
// PlantillaModal.jsx (ver handleElegir ahí). Selección puramente local a
// esta tabla: no se le informa al padre porque hoy no dispara ninguna acción
// aparte de resaltar en qué fila está el usuario. Ninguno de los dos clics
// tiene equivalente de teclado por sí solo (WCAG 2.1.1): Enter/Espacio sobre
// una fila ya seleccionada y enfocada la abre (mismo mapeo que un segundo
// clic en PlantillaModal), y cada fila/tarjeta además expone un botón real
// "Ver atención de <nombre>" para abrir en un solo paso sin depender de ese
// segundo Enter — su clic no debe además reseleccionar la fila, de ahí el
// stopPropagation en su onClick.
export default function AgendaTable({ items, onOpenAtencion }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (selectedId === id) onOpenAtencion(id);
    else setSelectedId(id);
  }

  return (
    <>
      <div className="hc-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="group-head" colSpan={4}>Hora</th>
              <th rowSpan={2} className="group-divider">Id. Afiliado</th>
              <th rowSpan={2}>Nombre Afiliado</th>
              <th rowSpan={2} className="col-descripcion">Descripción</th>
              <th className="group-head group-divider" colSpan={3}>Primera vez</th>
              <th rowSpan={2} className="group-divider">Tipo cita</th>
              <th rowSpan={2} className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
            <tr>
              <th>Cita</th>
              <th>Llegada</th>
              <th>Inicio atención</th>
              <th>Final atención</th>
              <th className="group-divider">Año</th>
              <th>IPS</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr
                key={a.id}
                className={[a.estado === 'atendido' ? 'row-atendido' : '', selectedId === a.id ? 'selected' : ''].filter(Boolean).join(' ') || undefined}
                aria-selected={selectedId === a.id}
                tabIndex={0}
                onClick={() => setSelectedId(a.id)}
                onKeyDown={(e) => handleRowKeyDown(e, a.id)}
                onDoubleClick={() => onOpenAtencion(a.id)}
              >
                <td className="cell-primary">{a.citaHora}</td>
                <td className="cell-muted">{a.llegadaHora || '—'}</td>
                <td className="cell-muted">{a.inicioHora || '—'}</td>
                <td className="cell-muted">{a.finalHora || '—'}</td>
                <td className="group-divider">{a.idAfiliado}</td>
                <td className="cell-primary">{a.nombreAfiliado}</td>
                <td className="col-descripcion">{a.descripcionServicio}</td>
                <td className="cell-muted group-divider">{a.primeraVez?.anio ?? '-'}</td>
                <td className="cell-muted">{a.primeraVez?.ips ?? '-'}</td>
                <td className="cell-muted">{a.primeraVez?.medico ?? '-'}</td>
                <td className="group-divider"><TipoBadge tipo={a.tipoCita} /></td>
                <td className="col-acciones">
                  <button
                    type="button"
                    className="row-open-btn"
                    onClick={(e) => { e.stopPropagation(); onOpenAtencion(a.id); }}
                    aria-label={`Ver atención de ${a.nombreAfiliado}`}
                  >
                    <LuChevronRight className="icon" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hc-cards">
        {items.map((a) => (
          <div
            className={`hc-card${a.estado === 'atendido' ? ' row-atendido' : ''}${selectedId === a.id ? ' selected' : ''}`}
            key={a.id}
            aria-selected={selectedId === a.id}
            tabIndex={0}
            onClick={() => setSelectedId(a.id)}
            onKeyDown={(e) => handleRowKeyDown(e, a.id)}
            onDoubleClick={() => onOpenAtencion(a.id)}
          >
            <div className="hc-card-top">
              <div className="hc-card-id">
                <div className="hc-card-name">{a.nombreAfiliado}</div>
                <div className="hc-card-doc">{a.idAfiliado} · {a.descripcionServicio}</div>
              </div>
              <TipoBadge tipo={a.tipoCita} />
            </div>
            <div className="hc-card-times">
              <span><b>Cita</b> {a.citaHora}</span>
              <span><b>Llegada</b> {a.llegadaHora || '—'}</span>
              <span><b>Inicio</b> {a.inicioHora || '—'}</span>
              <span><b>Final</b> {a.finalHora || '—'}</span>
            </div>
            {a.primeraVez && (
              <div className="hc-card-meta">
                Primera vez {a.primeraVez.anio} · {a.primeraVez.ips} · {a.primeraVez.medico}
              </div>
            )}
            <button
              type="button"
              className="hc-card-open-btn"
              onClick={(e) => { e.stopPropagation(); onOpenAtencion(a.id); }}
            >
              Ver atención
              <LuChevronRight className="icon" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
