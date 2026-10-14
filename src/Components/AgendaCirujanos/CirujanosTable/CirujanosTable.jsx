'use client';

import './CirujanosTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { minutosSemanales } from '@/hooks/AgendaCirujanos/disponibilidad';
import {
  diasParaVencer, ESTADO_AGENDA_LABEL, estadoAgenda, proximaExcepcion,
} from '@/hooks/AgendaCirujanos/estadoAgenda';
import { ETIQUETA_TIPO } from '@/hooks/AgendaCirujanos/excepciones';
import { fechaCorta, fechaLabel, formatoHoras } from '@/hooks/AgendaCirujanos/formato';
import { puedeEditarAgenda } from '@/hooks/AgendaCirujanos/permisos';

const TONO_ESTADO = {
  configurada: 'success', 'por-vencer': 'warn', vencida: 'danger', 'sin-configurar': 'neutral',
};

// Dos líneas: desde cuándo rige y hasta cuándo (con aviso si está por vencer).
function textoVigencia(horario, estado, hoy) {
  const desde = `Desde ${fechaLabel(horario.desde)}`;
  if (!horario.hasta) return [desde, 'Sin fecha de fin'];
  if (estado === 'vencida') return [desde, `Venció el ${fechaLabel(horario.hasta)}`];
  const dias = diasParaVencer(horario, hoy);
  let vence = '';
  if (estado === 'por-vencer') vence = dias === 0 ? ' · vence hoy' : ` · vence en ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return [desde, `Hasta ${fechaLabel(horario.hasta)}${vence}`];
}

const Vacio = () => <span className="ac-sub">—</span>;

// Tabla del listado. Fila clicable como atajo; el botón de la fila es la acción
// accesible por teclado. Cada <th> en sentence case con los tokens --th-*.
export default function CirujanosTable({
  filas, hoy, usuario, onAbrir,
}) {
  return (
    <div className="ac-tabla-wrap">
      <table className="ac-tabla">
        <thead>
          <tr>
            <th scope="col">Cirujano</th>
            <th scope="col">Sede</th>
            <th scope="col">Estado de agenda</th>
            <th scope="col">Horas por semana</th>
            <th scope="col">Vigencia</th>
            <th scope="col">Próxima excepción</th>
            <th scope="col"><span className="ac-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={7}><p className="ac-estado">Ningún cirujano coincide con la búsqueda o el filtro.</p></td>
            </tr>
          )}
          {filas.map(({ cirujano, agenda }) => {
            const horario = agenda?.horario ?? null;
            const estado = estadoAgenda(horario, hoy);
            const sinAgenda = estado === 'sin-configurar';
            const puede = puedeEditarAgenda(usuario, cirujano.idMedico);
            const proxima = proximaExcepcion(agenda?.excepciones ?? [], hoy);
            const [vigDesde, vigHasta] = horario ? textoVigencia(horario, estado, hoy) : [];
            const accion = sinAgenda ? 'Configurar agenda' : 'Editar agenda';
            const nombre = capitalizarNombre(cirujano.nombre);
            return (
              <tr
                key={cirujano.idMedico}
                className={puede ? 'ac-fila-clicable' : undefined}
                onClick={puede ? () => onAbrir(cirujano.idMedico) : undefined}
              >
                <td>
                  <div className="ac-nombre">{nombre}</div>
                  <div className="ac-sub">Cirujano</div>
                </td>
                <td>{cirujano.sede}</td>
                <td><Badge tone={TONO_ESTADO[estado]}>{ESTADO_AGENDA_LABEL[estado]}</Badge></td>
                <td className="ac-num">{horario ? formatoHoras(minutosSemanales(horario)) : <Vacio />}</td>
                <td>
                  {horario ? (
                    <>
                      <div>{vigDesde}</div>
                      <div className="ac-sub">{vigHasta}</div>
                    </>
                  ) : <Vacio />}
                </td>
                <td>
                  {proxima ? (
                    <>
                      <div>{ETIQUETA_TIPO[proxima.tipo]} · {proxima.motivo}</div>
                      <div className="ac-sub">
                        {fechaCorta(proxima.desde)}{proxima.hasta !== proxima.desde ? ` – ${fechaCorta(proxima.hasta)}` : ''}
                      </div>
                    </>
                  ) : <Vacio />}
                </td>
                <td className="ac-col-accion">
                  <Button
                    size="sm"
                    variant={sinAgenda || estado === 'vencida' ? 'primary' : 'outline'}
                    disabled={!puede}
                    aria-label={`${accion} de ${nombre}`}
                    onClick={(e) => { e.stopPropagation(); onAbrir(cirujano.idMedico); }}
                  >
                    {accion}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
