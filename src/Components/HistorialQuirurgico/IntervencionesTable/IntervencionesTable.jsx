'use client';

import './IntervencionesTable.css';
import EstadoIntervencionBadge from '../EstadoIntervencionBadge/EstadoIntervencionBadge';
import { fechaHoraCortaLabel } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';
import { LuEye } from 'react-icons/lu';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset -- CSS
// decide cuál mostrar bajo 768px (--bp-tablet), mismo patrón que
// AdmisionesTable/PatientsTable. `onSelect` abre IntervencionDetalleModal
// para esa intervención (ver HistorialQuirurgico.jsx) -- tanto clickear la
// fila como el botón "Ver detalle" de Acciones llaman al mismo handler, sin
// dos caminos con resultados distintos (mismo criterio que BedCard/
// BedActionsMenu en BedBoardModal.jsx). `selectedId` resalta la fila cuyo
// modal está abierto (null mientras no hay ninguno).
// Columnas ampliadas a las de un registro de programación completo (encargo
// explícito) -- sin ID afiliado/Afiliado: esta pantalla ya está en el
// contexto de un único paciente (PatientBanner arriba), repetirlo por fila
// era redundante. Con 12 columnas (11 + Acciones) la tabla no entra en el
// ancho de la card: se apoya en el scroll horizontal que ya trae
// `.hq-table-wrap` (overflow-x:auto, ver shared.css) en vez de forzar el
// wrap del texto.
export default function IntervencionesTable({ intervenciones, selectedId, onSelect }) {
  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <>
      <div className="hq-table-wrap selectable">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Programación</th>
              <th>ID Cirugía</th>
              <th>Fecha y hora</th>
              <th>ID Médico</th>
              <th>Médico</th>
              <th>ID Servicio</th>
              <th>Descripción de Servicio</th>
              <th>Habitación</th>
              <th>Días</th>
              <th>Reservó</th>
              <th>Estado</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {intervenciones.map((i) => (
              <tr
                key={i.id}
                className={selectedId === i.id ? 'selected' : undefined}
                aria-selected={selectedId === i.id}
                tabIndex={0}
                onClick={() => onSelect(i.id)}
                onKeyDown={(e) => handleRowKeyDown(e, i.id)}
              >
                <td className="cell-muted">{i.numeroProgramacion}</td>
                <td className="cell-muted">{i.codigoCirugia}</td>
                <td className="cell-primary">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</td>
                <td className="cell-muted">{i.idMedico}</td>
                <td className="cell-muted">{i.medico}</td>
                <td className="cell-muted">{i.idServicio}</td>
                <td className="cell-muted">{i.procedimientoPrincipal}</td>
                <td className="cell-muted">{i.habitacion}</td>
                <td className="cell-muted">{i.dias}</td>
                <td className="cell-muted">{i.reservo}</td>
                <td><EstadoIntervencionBadge estado={i.estado} /></td>
                <td className="col-acciones">
                  <button
                    type="button"
                    className="hq-icon-btn"
                    onClick={(e) => { e.stopPropagation(); onSelect(i.id); }}
                    aria-label={`Ver detalle de la cirugía ${i.codigoCirugia}`}
                    title="Ver detalle"
                  >
                    <LuEye className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hq-interv-cards">
        {intervenciones.map((i) => (
          <div
            className={`hq-interv-card${selectedId === i.id ? ' selected' : ''}`}
            key={i.id}
            aria-selected={selectedId === i.id}
            tabIndex={0}
            onClick={() => onSelect(i.id)}
            onKeyDown={(e) => handleRowKeyDown(e, i.id)}
          >
            <div className="hq-interv-card-top">
              <span className="hq-interv-card-fecha">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</span>
              <EstadoIntervencionBadge estado={i.estado} />
            </div>
            <div className="hq-interv-card-codigo">Cirugía {i.codigoCirugia}</div>
            <div className="hq-interv-card-medico">{i.medico}</div>
          </div>
        ))}
      </div>
    </>
  );
}
