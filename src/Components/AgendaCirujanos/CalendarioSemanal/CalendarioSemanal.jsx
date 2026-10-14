'use client';

import { LuTriangleAlert } from 'react-icons/lu';
import './CalendarioSemanal.css';
import { textoMotivo } from '@/hooks/AgendaCirujanos/conflictos';
import { fechaCorta } from '@/hooks/AgendaCirujanos/formato';
import { DIAS_SEMANA_CORTO, FIN_JORNADA, INICIO_JORNADA } from '@/hooks/AgendaCirujanos/horario';
import { aMinutos } from '@/hooks/AgendaCirujanos/intervalos';

// Alto de una hora en píxeles: el mismo valor se publica como --ac-hora-h para
// las líneas de la grilla.
const HORA_PX = 56;
const HORAS = (FIN_JORNADA - INICIO_JORNADA) / 60;
const ALTO_PX = HORAS * HORA_PX;

// Posición vertical (en px) de una franja, recortada a la jornada operativa;
// null si queda fuera de ella.
function posicion(inicio, fin) {
  const desde = Math.max(inicio, INICIO_JORNADA);
  const hasta = Math.min(fin, FIN_JORNADA);
  if (hasta <= desde) return null;
  return {
    top: ((desde - INICIO_JORNADA) / 60) * HORA_PX,
    height: ((hasta - desde) / 60) * HORA_PX,
  };
}

// Una cirugía pasada o realizada va en azul, una urgencia en violeta y el resto
// (programada) en verde: los mismos colores que la agenda de Programación.
function tonoCirugia(cirugia, hoy) {
  if (cirugia.fecha < hoy || cirugia.estado === 'realizada') return 'realizada';
  return cirugia.estado === 'urgencia' ? 'urgencia' : 'programada';
}

// Grilla semanal 07:00–19:00. Fondo = fuera de agenda; encima, en capas: lo
// disponible, las aperturas extra, las líneas de hora, los bloqueos (rayados) y
// las cirugías. Lun–Vie siempre; sábado/domingo solo si tienen algo que mostrar.
// `modelos[i]` es el modeloDia de `fechas[i]`; `motivos` mapea id de cirugía →
// motivo de conflicto.
export default function CalendarioSemanal({
  fechas, modelos, cirugias, motivos, hoy,
}) {
  const visibles = fechas
    .map((_, i) => i)
    .filter((i) => i < 5
      || modelos[i].efectivo.length > 0
      || modelos[i].aperturas.length > 0
      || modelos[i].bloqueos.length > 0
      || cirugias.some((c) => c.fecha === fechas[i]));

  return (
    <div className="ac-cal-scroll">
      <div
        className="ac-cal"
        style={{
          gridTemplateColumns: `56px repeat(${visibles.length}, minmax(110px, 1fr))`,
          '--ac-hora-h': `${HORA_PX}px`,
        }}
      >
        <div className="ac-cal-esquina" />
        {visibles.map((i) => (
          <div key={fechas[i]} className={`ac-cal-cab${fechas[i] === hoy ? ' hoy' : ''}`}>
            <small>{DIAS_SEMANA_CORTO[i].toUpperCase()}</small>
            <b>{fechaCorta(fechas[i])}</b>
          </div>
        ))}

        <div className="ac-cal-horas" style={{ height: ALTO_PX }}>
          {Array.from({ length: HORAS }, (_, h) => (
            <div key={h} className="ac-cal-hora" style={{ top: h * HORA_PX + 3 }}>
              {String(INICIO_JORNADA / 60 + h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {visibles.map((i) => {
          const fecha = fechas[i];
          const modelo = modelos[i];
          return (
            <div key={fecha} className="ac-cal-col" style={{ height: ALTO_PX }}>
              {modelo.base.map(([inicio, fin]) => {
                const pos = posicion(inicio, fin);
                return pos && <div key={`base-${inicio}-${fin}`} className="ac-seg ac-seg-base" style={pos} />;
              })}
              {modelo.aperturas.map(({ intervalo, excepcion }) => {
                const pos = posicion(intervalo[0], intervalo[1]);
                return pos && (
                  <div
                    key={`apertura-${excepcion.id}`}
                    className="ac-seg ac-seg-apertura"
                    style={pos}
                    title={`Apertura extra: ${excepcion.motivo}`}
                  >
                    <span>Apertura extra</span>
                  </div>
                );
              })}
              <div className="ac-cal-lineas" />
              {modelo.bloqueos.map(({ intervalo, excepcion }) => {
                const pos = posicion(intervalo[0], intervalo[1]);
                return pos && (
                  <div
                    key={`bloqueo-${excepcion.id}`}
                    className="ac-seg ac-seg-bloqueo"
                    style={pos}
                    title={`Bloqueo: ${excepcion.motivo}`}
                  >
                    <span>Bloqueo · {excepcion.motivo}</span>
                  </div>
                );
              })}
              {cirugias.filter((c) => c.fecha === fecha).map((cirugia) => {
                const pos = posicion(aMinutos(cirugia.horaInicio), aMinutos(cirugia.horaFin));
                if (!pos) return null;
                const motivo = motivos.get(cirugia.id);
                const paciente = cirugia.paciente?.nombre ?? '';
                return (
                  <div
                    key={cirugia.id}
                    className={`ac-cir ac-cir-${tonoCirugia(cirugia, hoy)}${motivo ? ' ac-cir-conflicto' : ''}`}
                    style={pos}
                    title={`${paciente} · ${cirugia.procedimientoPrincipal ?? ''}${motivo ? ` · ${textoMotivo(motivo)}` : ''}`}
                  >
                    <div className="ac-cir-hora">{cirugia.horaInicio} – {cirugia.horaFin}</div>
                    <div className="ac-cir-nombre">{paciente}</div>
                    <div className="ac-cir-proc">{cirugia.procedimientoPrincipal}</div>
                    {motivo && (
                      <LuTriangleAlert
                        className="icon ac-cir-alerta"
                        role="img"
                        aria-label={textoMotivo(motivo)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
