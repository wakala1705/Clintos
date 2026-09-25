'use client';

import { Fragment, useEffect, useRef } from 'react';
import {
  LuArrowDown, LuArrowUp, LuArrowUpDown, LuBan, LuCalendarClock, LuCalendarX,
  LuCheckCheck, LuChevronRight, LuDoorOpen, LuPackage,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import InconsistenciaBadge from '../InconsistenciaBadge/InconsistenciaBadge';
import InsumosComprometidosRow from '../InsumosComprometidosRow/InsumosComprometidosRow';
import { SALAS, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { antiguedadLabel, clasificarInconsistencia, duracionMin } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasTable.css';

const TOTAL_COLUMNAS = 8;

// Acción sugerida por tipo (spec, tabla de clasificación). "Ver insumos" no
// resuelve nada: expande la fila, porque ahí conviene mirar antes de decidir.
const SUGERIDA = {
  trasladado: { accion: 'realizada', label: 'Marcar realizada', icon: LuCheckCheck },
  'sin-actividad': { accion: 'incumplida', label: 'Marcar incumplida', icon: LuCalendarX },
  insumos: { accion: 'ver-insumos', label: 'Ver insumos', icon: LuPackage },
};

function salaDescripcion(salaId) {
  return SALAS.find((s) => s.value === salaId)?.descripcion ?? salaId;
}

export default function VencidasTable({
  items, hoy, orden, onOrdenar,
  seleccion, onToggleSeleccion, onToggleTodas,
  expandidas, onToggleExpandida, onAccion,
}) {
  const checkTodasRef = useRef(null);
  const seleccionadasEnPagina = items.filter((c) => seleccion.has(c.id)).length;
  const todasSeleccionadas = items.length > 0 && seleccionadasEnPagina === items.length;

  useEffect(() => {
    if (checkTodasRef.current) {
      checkTodasRef.current.indeterminate = seleccionadasEnPagina > 0 && !todasSeleccionadas;
    }
  }, [seleccionadasEnPagina, todasSeleccionadas]);

  function thOrdenable(columna, label, className = '') {
    const activa = orden?.columna === columna;
    let Icono = LuArrowUpDown;
    if (activa) Icono = orden.direccion === 'asc' ? LuArrowUp : LuArrowDown;
    let ariaSort = 'none';
    if (activa) ariaSort = orden.direccion === 'asc' ? 'ascending' : 'descending';
    return (
      <th className={className} aria-sort={ariaSort}>
        <button type="button" className={`rv-sort-btn${activa ? ' active' : ''}`} onClick={() => onOrdenar(columna)}>
          {label}
          <Icono className="icon" aria-hidden="true" />
        </button>
      </th>
    );
  }

  return (
    <div className="rv-table-wrap">
      <table className="rv-table">
        <thead>
          <tr>
            <th className="rv-col-check">
              <input
                ref={checkTodasRef}
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={onToggleTodas}
                aria-label="Seleccionar todas las de esta página"
              />
            </th>
            {thOrdenable('inconsistencia', 'Inconsistencia')}
            {thOrdenable('paciente', 'Paciente')}
            {thOrdenable('fecha', 'Fecha programada')}
            {thOrdenable('sala', 'Sala')}
            {thOrdenable('duracion', 'Duración', 'rv-num')}
            <th>No. Prog. / Consecutivo</th>
            <th className="rv-col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const tipo = clasificarInconsistencia(c);
            const numero = c.numeroProgramacion ?? c.id;
            const seleccionada = seleccion.has(c.id);
            const expandida = expandidas.has(c.id);
            const detalleId = `rv-insumos-${c.id}`;
            const sugerida = SUGERIDA[tipo];
            const sugeridaLabel = tipo === 'insumos' && expandida ? 'Ocultar insumos' : sugerida.label;
            return (
              <Fragment key={c.id}>
                <tr className={`rv-row${seleccionada ? ' selected' : ''}`}>
                  <td className="rv-col-check">
                    <input
                      type="checkbox"
                      checked={seleccionada}
                      onChange={() => onToggleSeleccion(c.id)}
                      aria-label={`Seleccionar programación ${numero}`}
                    />
                  </td>
                  <td>
                    <div className="rv-tipo-cell">
                      {tipo === 'insumos' ? (
                        <button
                          type="button"
                          className="rv-expand-btn"
                          aria-expanded={expandida}
                          aria-controls={detalleId}
                          aria-label={expandida ? 'Ocultar insumos' : 'Ver insumos'}
                          onClick={() => onToggleExpandida(c.id)}
                        >
                          <LuChevronRight className={`icon${expandida ? ' open' : ''}`} aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="rv-expand-spacer" />
                      )}
                      <InconsistenciaBadge tipo={tipo} />
                    </div>
                    {(c.farmacia?.numeroPedido || c.traslado) && (
                      <div className="rv-trazabilidad">
                        {c.farmacia?.numeroPedido && (
                          <span>
                            <LuPackage className="icon" aria-hidden="true" />
                            Pedido {c.farmacia.numeroPedido}
                          </span>
                        )}
                        {c.traslado && (
                          <span>
                            <LuDoorOpen className="icon" aria-hidden="true" />
                            Adm. {c.traslado.numeroAdmision}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="rv-cell-primary">{c.paciente.nombre}</div>
                    <div className="rv-cell-secondary">{c.paciente.documento}</div>
                  </td>
                  <td className="rv-nowrap">
                    <div className="rv-cell-primary">{fechaLabel(c.fecha)} · {c.horaInicio}</div>
                    <div className="rv-cell-secondary">{antiguedadLabel(c.fecha, hoy)}</div>
                  </td>
                  <td>{salaDescripcion(c.salaId)}</td>
                  <td className="rv-num rv-nowrap">{duracionMin(c)} min</td>
                  <td>
                    <div className="rv-cell-primary">{numero}</div>
                    <div className="rv-cell-secondary">{c.consecutivo ?? '—'}</div>
                  </td>
                  <td className="rv-col-acciones">
                    <div className="rv-acciones">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={sugerida.icon}
                        aria-expanded={tipo === 'insumos' ? expandida : undefined}
                        aria-controls={tipo === 'insumos' ? detalleId : undefined}
                        onClick={() => (tipo === 'insumos' ? onToggleExpandida(c.id) : onAccion(sugerida.accion, c))}
                      >
                        {sugeridaLabel}
                      </Button>
                      <DropdownMenu
                        label={`Más acciones para ${c.paciente.nombre}`}
                        items={[
                          {
                            id: 'realizada', label: 'Marcar realizada', icon: LuCheckCheck, onSelect: () => onAccion('realizada', c),
                          },
                          {
                            id: 'incumplida', label: 'Marcar incumplida', icon: LuCalendarX, tone: 'warn', onSelect: () => onAccion('incumplida', c),
                          },
                          {
                            id: 'reprogramar', label: 'Reprogramar', icon: LuCalendarClock, onSelect: () => onAccion('reprogramar', c),
                          },
                          {
                            id: 'cancelar', label: 'Cancelar', icon: LuBan, tone: 'danger', dividerBefore: true, onSelect: () => onAccion('cancelar', c),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
                {tipo === 'insumos' && expandida && (
                  <InsumosComprometidosRow id={detalleId} cirugia={c} colSpan={TOTAL_COLUMNAS} />
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
