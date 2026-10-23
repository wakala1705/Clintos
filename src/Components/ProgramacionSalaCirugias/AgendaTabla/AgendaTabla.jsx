'use client';

import './AgendaTabla.css';
import Badge from '@/Components/Badge/Badge';
import CirugiaCardMenu from '../CirugiaCardMenu/CirugiaCardMenu';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import FiltrosBar from '../FiltrosBar/FiltrosBar';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { SALAS, fechaCortaMesLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { minutosCirugia } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { ordenarCirugiasAgenda } from '@/hooks/ProgramacionSalaCirugias/agendaTabla/agendaTabla';

// Vista alterna de la agenda (formato "Tabla"): las mismas cirugías que dibuja
// el calendario para el rango activo (día/semana/mes), una por fila. Comparte
// la fila de navegación + filtros con AgendaSemana/AgendaMes
// (.psc-agenda-nav en shared.css). Clic (o Enter) en una fila abre el detalle;
// el "⋯" actúa sobre esa cirugía sin seleccionarla (`.at-menu` corta la
// propagación, igual que `.cdt-menu` en CirugiasDiaTable).
export default function AgendaTabla({
  label, cirugias, selectedId, onSelect, onPrev, onNext, navPrevLabel, navNextLabel,
  sedeId, salaId, onSalaChange, estado, onEstadoChange, cirujano = 'todos', cirujanos, onCirujanoChange,
  modoAgenda, onModoAgenda, vista, onChangeVista, diasVista, onDiasVista,
  formato, onFormato,
  onReprogramarCirugia, onMarcarRealizada, onMarcarIncumplida, onCancelarCirugia, onEditarCirugia,
}) {
  const filas = ordenarCirugiasAgenda(cirugias);
  const salaLabel = (id) => SALAS.find((s) => s.value === id)?.descripcion ?? id;
  // Con una sala elegida en el filtro la columna sería redundante; solo en la
  // agenda por médicos (cruza salas, `salaId === 'todas'`) aporta información.
  const mostrarSala = salaId === 'todas';

  return (
    <div className="at-wrap">
      <div className="psc-agenda-nav">
        <div className="psc-agenda-nav-date">
          <button type="button" className="psc-agenda-nav-btn" aria-label={navPrevLabel} onClick={onPrev}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="psc-agenda-nav-label">{label}</span>
          <button type="button" className="psc-agenda-nav-btn" aria-label={navNextLabel} onClick={onNext}>
            <LuChevronRight className="icon" />
          </button>
        </div>

        <FiltrosBar
          sedeId={sedeId}
          salaId={salaId}
          onSalaChange={onSalaChange}
          estado={estado}
          onEstadoChange={onEstadoChange}
          cirujano={cirujano}
          cirujanos={cirujanos}
          onCirujanoChange={onCirujanoChange}
          modoAgenda={modoAgenda}
          onModoAgenda={onModoAgenda}
          vista={vista}
          onChangeVista={onChangeVista}
          jornada="operativa"
          onJornada={() => {}}
          ocultarJornada
          diasVista={diasVista}
          onDiasVista={onDiasVista}
          formato={formato}
          onFormato={onFormato}
        />
      </div>

      <div className="at-scroll">
        <table className="at-table">
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Hora</th>
              {mostrarSala && <th scope="col">Sala</th>}
              <th scope="col">Paciente</th>
              <th scope="col">Procedimiento</th>
              <th scope="col">Médico</th>
              <th scope="col" className="at-num">Duración</th>
              <th scope="col">Estado</th>
              <th scope="col"><span className="at-sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr className="at-empty">
                <td colSpan={mostrarSala ? 9 : 8}>Sin cirugías en este rango</td>
              </tr>
            )}
            {filas.map((c) => (
              <tr
                key={c.id}
                className={[c.id === selectedId && 'selected', c.estado === 'realizada' && 'finalizada'].filter(Boolean).join(' ') || undefined}
                tabIndex={0}
                aria-selected={c.id === selectedId}
                onClick={() => onSelect(c.id === selectedId ? null : c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === e.currentTarget) onSelect(c.id === selectedId ? null : c.id);
                }}
              >
                <td className="at-fecha">{fechaCortaMesLabel(c.fecha)}</td>
                <td className="at-hora">{c.horaInicio} – {c.horaFin}</td>
                {mostrarSala && <td>{salaLabel(c.salaId)}</td>}
                <td>
                  <span className="at-main">{c.paciente.nombre}</span>
                </td>
                <td>
                  <span className="at-proc">
                    {c.procedimientoPrincipal}
                    {c.estado === 'urgencia' && <Badge tone="warn">Urgencia</Badge>}
                  </span>
                </td>
                <td>{capitalizarNombre(c.cirujano)}</td>
                <td className="at-num">{minutosCirugia(c)} min</td>
                <td><EstadoCirugiaBadge estado={c.estado} /></td>
                <td className="at-actions">
                  <div
                    className="at-menu"
                    role="presentation"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <CirugiaCardMenu
                      cirugia={c}
                      size="base"
                      onEditar={onEditarCirugia}
                      onReprogramar={onReprogramarCirugia}
                      onMarcarRealizada={onMarcarRealizada}
                      onMarcarIncumplida={onMarcarIncumplida}
                      onCancelar={onCancelarCirugia}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
