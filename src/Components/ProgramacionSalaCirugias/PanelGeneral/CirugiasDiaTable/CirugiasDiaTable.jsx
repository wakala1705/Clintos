'use client';

import './CirugiasDiaTable.css';
import { LuCircleCheck, LuClipboardList, LuFileText, LuPlay } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import CirugiaCardMenu from '../../CirugiaCardMenu/CirugiaCardMenu';
import EstadoDiaBadge from '../EstadoDiaBadge/EstadoDiaBadge';
import { canastaPedida, canastaVinculada, estadoVisual } from '@/hooks/ProgramacionSalaCirugias/panel/panel';
import { CANASTA_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { estaIniciada, fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { minutosCirugia } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';

// Tabla de las cirugías del rango elegido. Con `soloHora` (rango "Hoy") la
// fecha sería redundante: la columna muestra solo la hora.
// Clic (o Enter) en una fila abre el detalle;
// el "⋯" actúa sobre esa cirugía (reprogramar, cancelar, marcar realizada/
// incumplida) sin seleccionarla -- `.cdt-menu` corta la propagación, igual
// que `.cc-menu-wrap` en CirugiaCard.
export default function CirugiasDiaTable({
  filas, ahora, salaLabel, selectedId, onSelect,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
  motivoNoIniciable, onIniciar, onAbrirHoja, onFinalizar, onIrAHc, soloHora = false,
}) {
  return (
    <div className="cdt-scroll">
      <table className="cdt-table">
        <thead>
          <tr>
            <th scope="col">{soloHora ? 'Hora' : 'Fecha y hora'}</th>
            <th scope="col">Sala</th>
            <th scope="col" className="cdt-num">Duración</th>
            <th scope="col">Paciente</th>
            <th scope="col">Procedimiento</th>
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
            const iniciada = estaIniciada(c);
            // Abierta y sin iniciar: se ofrece "Iniciar" (deshabilitado con su motivo si no se cumple una regla).
            const puedeIniciar = !iniciada && ['programada', 'urgencia'].includes(c.estado);
            const motivoIniciar = puedeIniciar ? motivoNoIniciable(c) : null;
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
              <td className="cdt-hora">{soloHora ? c.horaInicio : fechaHoraRangoLabel(c.fecha, c.horaInicio)}</td>
              <td>{salaLabel(c.salaId)}</td>
              <td className="cdt-num">{minutosCirugia(c)} min</td>
              <td>
                <span className="cdt-main">{c.paciente.nombre}</span>
              </td>
              <td>
                <span className="cdt-proc">
                  {c.procedimientoPrincipal}
                  {c.estado === 'urgencia' && <Badge tone="warn">Urgencia</Badge>}
                </span>
              </td>
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
                  {iniciada && (
                    <>
                      <Button size="sm" variant="outline" icon={LuClipboardList} onClick={() => onAbrirHoja(c)}>Hoja de gasto</Button>
                      <Button size="sm" icon={LuCircleCheck} onClick={() => onFinalizar(c)}>Finalizar</Button>
                    </>
                  )}
                  {c.estado === 'realizada' && !iniciada && (
                    <Button size="sm" variant="outline" icon={LuFileText} onClick={() => onIrAHc(c)}>Ir a HC</Button>
                  )}
                  {puedeIniciar && (
                    <span className="cdt-iniciar" title={motivoIniciar ?? undefined}>
                      <Button size="sm" icon={LuPlay} disabled={Boolean(motivoIniciar)} onClick={() => onIniciar(c)}>Iniciar</Button>
                    </span>
                  )}
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
