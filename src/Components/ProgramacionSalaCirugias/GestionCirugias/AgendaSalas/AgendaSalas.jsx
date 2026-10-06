import { useEffect, useRef } from 'react';
import { LuCalendarCheck, LuChevronLeft, LuChevronRight, LuCircleCheck, LuWrench } from 'react-icons/lu';
import './AgendaSalas.css';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import {
  JORNADAS, duracionLabel, horaFranja, rangoLabel,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { diaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const OPCIONES_JORNADA = Object.entries(JORNADAS).map(([value, j]) => ({
  value,
  label: value === 'operativa' ? `${j.label} (${horaFranja(j.desde).slice(0, 2)}–${horaFranja(j.hasta).slice(0, 2)} h)` : j.label,
}));

// Agenda de salas del día: una columna por sala. Los índices de franja son
// siempre los del día completo (48 de 30 min); `jornada` (24h | operativa)
// solo decide qué filas se ven. Las franjas libres son botones; la cirugía que
// se programa es el bloque destacado (interactive-selected).
// `salas` = [{ id, nombre, bloques, mapa }] (null mientras carga).
export default function AgendaSalas({
  fecha, date, onDia, salas, seleccion, duracion, onElegir, jornada, onJornada,
}) {
  const { desde, hasta } = JORNADAS[jornada];
  const filas = Array.from({ length: hasta - desde }, (_, k) => desde + k);
  const estaRef = useRef(null);
  // Mantiene a la vista el bloque de esta cirugía al moverlo, cambiar de día o de jornada.
  useEffect(() => {
    estaRef.current?.scrollIntoView({ block: 'center' });
  }, [seleccion, duracion, fecha, jornada]);

  // Un bloque se recorta a la ventana visible; fuera de ella no se dibuja.
  const visible = (inicio, dur) => {
    const i = Math.max(inicio, desde);
    const f = Math.min(inicio + dur, hasta);
    return f > i ? { fila: `${i - desde + 1} / span ${f - i}`, inicio: i, dur: f - i } : null;
  };

  return (
    <section className="as2-card" aria-label="Agenda de salas">
      <header className="as2-header">
        <div className="as2-nav">
          <button type="button" className="as2-nav-btn" aria-label="Día anterior" onClick={() => onDia(-1)}>
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <h3 className="as2-fecha" aria-live="polite">{diaLabel(date)}</h3>
          <button type="button" className="as2-nav-btn" aria-label="Día siguiente" onClick={() => onDia(1)}>
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
        <SegmentedFilterBar
          options={OPCIONES_JORNADA}
          value={jornada}
          onChange={onJornada}
          ariaLabel="Horas que muestra la agenda"
        />
      </header>
      <div className="as2-subheader">
        <p className="as2-ayuda">
          Selecciona una franja libre. La duración estimada es de {duracionLabel(duracion)}.
        </p>
        <ul className="as2-leyenda" aria-label="Leyenda">
          <li><span className="as2-sw as2-sw-ocupado" aria-hidden="true"><LuCalendarCheck className="icon" /></span>Ocupado</li>
          <li><span className="as2-sw as2-sw-nd" aria-hidden="true"><LuWrench className="icon" /></span>No disponible</li>
          <li><span className="as2-sw as2-sw-esta" aria-hidden="true"><LuCircleCheck className="icon" /></span>Esta cirugía</li>
        </ul>
      </div>

      {salas === null ? (
        <p className="as2-cargando" role="status">Cargando agenda…</p>
      ) : (
        <div className="as2-scroll">
          <div className="as2-grid" style={{ '--as2-cols': salas.length, '--as2-filas': filas.length }}>
            <div className="as2-esquina" />
            {salas.map((s) => (
              <div key={s.id} className="as2-sala-head">{s.nombre}</div>
            ))}

            <div className="as2-horas" aria-hidden="true">
              {filas.map((i) => (
                <div key={i} className="as2-hora">{i % 2 === 0 ? horaFranja(i) : ''}</div>
              ))}
            </div>

            {salas.map((s) => {
              const aqui = seleccion?.salaId === s.id;
              const esta = aqui ? visible(seleccion.inicio, duracion) : null;
              return (
                <div key={s.id} className="as2-col" role="group" aria-label={s.nombre}>
                  {filas.map((i) => {
                    const enSeleccion = aqui && i >= seleccion.inicio && i < seleccion.inicio + duracion;
                    if (s.mapa[i] || enSeleccion) return null;
                    return (
                      <button
                        key={i}
                        type="button"
                        className="as2-libre"
                        style={{ gridRow: i - desde + 1 }}
                        aria-label={`${s.nombre}, ${horaFranja(i)}, libre`}
                        onClick={() => onElegir(s.id, i)}
                      />
                    );
                  })}

                  {s.bloques.map((b) => {
                    const v = visible(b.inicio, b.dur);
                    if (!v) return null;
                    return (
                      <div
                        key={`${b.inicio}-${b.titulo}`}
                        className={`as2-bloque ${b.tipo === 'ocupado' ? 'as2-ocupado' : 'as2-nd'}`}
                        style={{ gridRow: v.fila }}
                        title={`${b.titulo}${b.cirujano ? ` · ${b.cirujano}` : ''} · ${rangoLabel(b.inicio, b.dur)}`}
                      >
                        <span className="as2-bloque-top">
                          {b.tipo === 'ocupado'
                            ? <LuCalendarCheck className="icon" aria-hidden="true" />
                            : <LuWrench className="icon" aria-hidden="true" />}
                          <span className="as2-bloque-titulo">
                            <span className="as2-sr">{b.tipo === 'ocupado' ? 'Ocupado: ' : 'No disponible: '}</span>
                            {b.titulo}{b.cirujano ? ` · ${b.cirujano}` : ''}
                          </span>
                        </span>
                        {v.dur > 1 && <span className="as2-bloque-sub">{rangoLabel(b.inicio, b.dur)}</span>}
                      </div>
                    );
                  })}

                  {esta && (
                    <div ref={estaRef} className="as2-bloque as2-esta" style={{ gridRow: esta.fila }}>
                      <span className="as2-bloque-top">
                        <LuCircleCheck className="icon" aria-hidden="true" />
                        <span className="as2-bloque-titulo">Esta cirugía</span>
                      </span>
                      <span className="as2-bloque-sub">{rangoLabel(seleccion.inicio, duracion)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
