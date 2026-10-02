'use client';

import './CirugiasDiaTable.css';
import Badge from '@/Components/Badge/Badge';
import CirugiaCardMenu from '../../CirugiaCardMenu/CirugiaCardMenu';
import EstadoDiaBadge from '../EstadoDiaBadge/EstadoDiaBadge';
import { estadoVisual } from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import { minutosCirugia } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';

// Tabla de las cirugías de hoy. Clic (o Enter) en una fila abre el detalle;
// el "⋯" actúa sobre esa cirugía (reprogramar, cancelar, marcar realizada/
// incumplida) sin seleccionarla -- `.cdt-menu` corta la propagación, igual
// que `.cc-menu-wrap` en CirugiaCard.
export default function CirugiasDiaTable({
  filas, ahora, salaLabel, selectedId, onSelect,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  return (
    <div className="cdt-scroll">
      <table className="cdt-table">
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Sala</th>
            <th scope="col">Paciente</th>
            <th scope="col">Procedimiento</th>
            <th scope="col">Cirujano</th>
            <th scope="col" className="cdt-num">Duración</th>
            <th scope="col">Estado</th>
            <th scope="col"><span className="cdt-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((c) => (
            <tr
              key={c.id}
              className={c.id === selectedId ? 'selected' : undefined}
              tabIndex={0}
              aria-selected={c.id === selectedId}
              onClick={() => onSelect(c.id === selectedId ? null : c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target === e.currentTarget) onSelect(c.id === selectedId ? null : c.id);
              }}
            >
              <td className="cdt-hora">{c.horaInicio}</td>
              <td>{salaLabel(c.salaId)}</td>
              <td>
                <span className="cdt-main">{c.paciente.nombre}</span>
                <span className="cdt-sub">{c.paciente.documento}</span>
              </td>
              <td>
                <span className="cdt-proc">
                  {c.procedimientoPrincipal}
                  {c.estado === 'urgencia' && <Badge tone="warn">Urgencia</Badge>}
                </span>
                {c.tipoAnestesia ? <span className="cdt-sub">Anestesia {c.tipoAnestesia.toLowerCase()}</span> : null}
              </td>
              <td>{c.cirujano}</td>
              <td className="cdt-num">{minutosCirugia(c)} min</td>
              <td><EstadoDiaBadge estado={estadoVisual(c, ahora)} /></td>
              <td className="cdt-actions">
                <div
                  className="cdt-menu"
                  role="presentation"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <CirugiaCardMenu
                    cirugia={c}
                    size="base"
                    onReprogramar={onReprogramar}
                    onMarcarRealizada={onMarcarRealizada}
                    onMarcarIncumplida={onMarcarIncumplida}
                    onCancelar={onCancelar}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
