import { useEffect, useRef } from 'react';
import { LuCalendarCheck, LuChevronLeft, LuChevronRight, LuCircleCheck, LuWrench } from 'react-icons/lu';
import './AgendaSalas.css';
import {
  FRANJAS, horaFranja, rangoLabel,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const INDICES = Array.from({ length: FRANJAS }, (_, i) => i);

// Agenda de salas del día: una columna por sala, franjas de 30 min de 07:00 a
// 15:00. Las franjas libres son botones; la cirugía que se programa es el
// bloque destacado (interactive-selected) que el usuario ubica con un clic.
export default function AgendaSalas({
  fecha, onDia, salas, seleccion, duracion, onElegir,
}) {
  const estaRef = useRef(null);
  // Mantiene a la vista el bloque de esta cirugía al moverlo o cambiar de día.
  useEffect(() => {
    estaRef.current?.scrollIntoView({ block: 'nearest' });
  }, [seleccion, duracion, fecha]);

  return (
    <section className="gc-card as-card" aria-label="Agenda de salas">
      <header className="as-header">
        <div>
          <h2 className="gc-card-titulo">Agenda de salas</h2>
          <p className="gc-card-sub">Haz clic en una franja libre para ubicar la cirugía.</p>
        </div>
        <div className="as-nav">
          <button type="button" className="as-nav-btn" aria-label="Día anterior" onClick={() => onDia(-1)}>
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <span className="as-fecha" aria-live="polite">{diaCortoLabel(fecha)}</span>
          <button type="button" className="as-nav-btn" aria-label="Día siguiente" onClick={() => onDia(1)}>
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <ul className="as-leyenda" aria-label="Leyenda">
        <li><span className="as-sw as-sw-ocupado" aria-hidden="true"><LuCalendarCheck className="icon" /></span>Ocupado</li>
        <li><span className="as-sw as-sw-nd" aria-hidden="true"><LuWrench className="icon" /></span>No disponible</li>
        <li><span className="as-sw as-sw-esta" aria-hidden="true"><LuCircleCheck className="icon" /></span>Esta cirugía</li>
      </ul>

      <div className="as-scroll">
        <div className="as-grid" style={{ '--as-cols': salas.length }}>
          <div className="as-esquina" />
          {salas.map((s) => (
            <div key={s.id} className="as-sala-head">{s.nombre}</div>
          ))}

          <div className="as-horas" aria-hidden="true">
            {INDICES.map((i) => (
              <div key={i} className="as-hora">{i % 2 === 0 ? horaFranja(i) : ''}</div>
            ))}
          </div>

          {salas.map((s) => {
            const aqui = seleccion?.salaId === s.id;
            return (
              <div key={s.id} className="as-col" role="group" aria-label={s.nombre}>
                {INDICES.map((i) => {
                  const ocupada = s.mapa[i];
                  const enSeleccion = aqui && i >= seleccion.inicio && i < seleccion.inicio + duracion;
                  if (ocupada || enSeleccion) return null;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="as-libre"
                      style={{ gridRow: i + 1 }}
                      aria-label={`${s.nombre}, ${horaFranja(i)}, libre`}
                      onClick={() => onElegir(s.id, i)}
                    >
                      <span className="as-libre-hora" aria-hidden="true">{horaFranja(i)}</span>
                    </button>
                  );
                })}

                {s.bloques.map((b) => (
                  <div
                    key={`${b.inicio}-${b.titulo}`}
                    className={`as-bloque ${b.tipo === 'ocupado' ? 'as-ocupado' : 'as-nd'}`}
                    style={{ gridRow: `${b.inicio + 1} / span ${b.dur}` }}
                    title={`${b.titulo}${b.cirujano ? ` · ${b.cirujano}` : ''} · ${rangoLabel(b.inicio, b.dur)}`}
                  >
                    <span className="as-bloque-top">
                      {b.tipo === 'ocupado'
                        ? <LuCalendarCheck className="icon" aria-hidden="true" />
                        : <LuWrench className="icon" aria-hidden="true" />}
                      <span className="as-bloque-titulo">{b.tipo === 'ocupado' ? 'Ocupado' : 'No disponible'} · {b.titulo}</span>
                    </span>
                    {b.cirujano && b.dur > 1 && <span className="as-bloque-sub">{b.cirujano}</span>}
                  </div>
                ))}

                {aqui && (
                  <div
                    ref={estaRef}
                    className="as-bloque as-esta"
                    style={{ gridRow: `${seleccion.inicio + 1} / span ${duracion}` }}
                  >
                    <span className="as-bloque-top">
                      <LuCircleCheck className="icon" aria-hidden="true" />
                      <span className="as-bloque-titulo">Esta cirugía</span>
                    </span>
                    <span className="as-bloque-sub">{rangoLabel(seleccion.inicio, duracion)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
