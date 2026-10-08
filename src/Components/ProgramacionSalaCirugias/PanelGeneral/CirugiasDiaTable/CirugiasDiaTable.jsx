'use client';

import './CirugiasDiaTable.css';
import Badge from '@/Components/Badge/Badge';
import CirugiaCardMenu from '../../CirugiaCardMenu/CirugiaCardMenu';
import EstadoDiaBadge from '../EstadoDiaBadge/EstadoDiaBadge';
import { canastaPedida, canastaVinculada, estadoVisual } from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import { CANASTA_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { minutosCirugia } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';

// Tabla de las cirugías de hoy (el cirujano va bajo el procedimiento). Clic (o Enter) en una fila abre el detalle;
// el "⋯" actúa sobre esa cirugía (reprogramar, cancelar, marcar realizada/
// incumplida) sin seleccionarla -- `.cdt-menu` corta la propagación, igual
// que `.cc-menu-wrap` en CirugiaCard.
export default function CirugiasDiaTable({
  filas, ahora, salaLabel, mostrarFecha = false, selectedId, onSelect,
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
            <th scope="col" className="cdt-num">Duración</th>
            <th scope="col">Canasta vinculada</th>
            <th scope="col">Canasta pedida</th>
            <th scope="col">Estado</th>
            <th scope="col"><span className="cdt-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((c) => {
            const vinculada = canastaVinculada(c);
            const pedida = canastaPedida(c);
            return (
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
              <td className="cdt-hora">
                {c.horaInicio}
                {mostrarFecha ? <span className="cdt-sub">{diaCortoLabel(c.fecha).replace(/ d{4}$/, '')}</span> : null}
              </td>
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
                <span className="cdt-sub">{c.cirujano}</span>
              </td>
              <td className="cdt-num">{minutosCirugia(c)} min</td>
              <td>
                <Badge tone={vinculada ? 'success' : 'neutral'}>{vinculada ? 'Vinculada' : 'No vinculada'}</Badge>
              </td>
              <td>
                {pedida ? (
                  <>
                    <Badge {...badgeProps(CANASTA_META[pedida.estado])}>{pedida.label}</Badge>
                  </>
                ) : <span className="cdt-sub">—</span>}
              </td>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
