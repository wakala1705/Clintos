import { useEffect, useRef } from 'react';
import { LuCalendarCheck, LuChevronLeft, LuChevronRight, LuCircleCheck, LuWrench } from 'react-icons/lu';
import './AgendaSalas.css';
import VistaAgenda from '../VistaAgenda/VistaAgenda';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  JORNADAS, duracionLabel, horaFranja, rangoLabel,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Tras el bloque de esta cirugía se dibujan, más tenues, el tiempo postquirúrgico
// y el de recuperación: no ocupan el quirófano, pero muestran el proceso completo.
// Agenda semanal de una sala: una columna por día (lunes a domingo; con
// la vista de días el modal ya entrega solo los días a mostrar). Los índices de franja son
// siempre los del día completo (48 de 30 min); `jornada` (24h | operativa)
// solo decide qué filas se ven. Las franjas libres son botones; la cirugía que
// se programa es el bloque destacado (interactive-selected).
// `dias` = [{ id: 'YYYY-MM-DD', bloques, mapa }] (null mientras carga); la
// selección usa ese `id` como `colId`.
export default function AgendaSalas({
  etiqueta, onSemana, salas, salaId, onSala, dias, diasVista, onDiasVista, hoy, postFranjas, recupFranjas, seleccion, duracion, onElegir, jornada, onJornada,
}) {
  const { desde, hasta } = JORNADAS[jornada];
  const filas = Array.from({ length: hasta - desde }, (_, k) => desde + k);
  const estaRef = useRef(null);
  // Mantiene a la vista el bloque de esta cirugía al moverlo, cambiar de día o de jornada.
  useEffect(() => {
    estaRef.current?.scrollIntoView({ block: 'center' });
  }, [seleccion, duracion, jornada]);

  const fueraDeJornada = (i) => i < JORNADAS.operativa.desde || i >= JORNADAS.operativa.hasta;

  // Un bloque se recorta a la ventana visible; fuera de ella no se dibuja.
  const visible = (inicio, dur) => {
    const i = Math.max(inicio, desde);
    const f = Math.min(inicio + dur, hasta);
    return f > i ? { fila: `${i - desde + 1} / span ${f - i}`, inicio: i, dur: f - i } : null;
  };

  return (
    <section className="as2-card" aria-label="Agenda semanal de la sala">
      <header className="as2-header">
        <div className="as2-nav">
          <button type="button" className="as2-nav-btn" aria-label="Semana anterior" onClick={() => onSemana(-1)}>
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <h3 className="as2-fecha" aria-live="polite">{etiqueta}</h3>
          <button type="button" className="as2-nav-btn" aria-label="Semana siguiente" onClick={() => onSemana(1)}>
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
        <div className="as2-controles">
          <div className="as2-sala">
            <FormSelect
              id="as2-sala"
              ariaLabel="Sala"
              value={salaId}
              onChange={onSala}
              options={salas.map((x) => ({ value: x.value, label: x.descripcion }))}
            />
          </div>
          <VistaAgenda
            jornada={jornada}
            onJornada={onJornada}
            diasVista={diasVista}
            onDiasVista={onDiasVista}
          />
        </div>
      </header>
      {dias === null ? (
        <p className="as2-cargando" role="status">Cargando agenda…</p>
      ) : (
        <div className="as2-scroll">
          <div className="as2-grid" style={{ '--as2-cols': dias.length, '--as2-filas': filas.length }}>
            <div className="as2-esquina" />
            {dias.map((d) => {
              const [dow, num, mes] = diaCortoLabel(d.id).split(' ');
              return (
                <div
                  key={d.id}
                  className={`as2-sala-head${d.id === seleccion?.colId ? ' as2-head-sel' : ''}`}
                  aria-label={diaCortoLabel(d.id)}
                >
                  <span className="as2-dow">{dow}</span>
                  <span className={`as2-num${d.id === hoy ? ' as2-hoy' : ''}`}>{num}</span>
                  <span className="as2-mes">{mes}</span>
                </div>
              );
            })}

            <div className="as2-horas" aria-hidden="true">
              {filas.map((i) => (
                <div key={i} className={`as2-hora${i % 2 === 1 ? ' as2-media' : ''}`}>{i % 2 === 0 ? horaFranja(i) : ''}</div>
              ))}
            </div>

            {dias.map((s) => {
              const aqui = seleccion?.colId === s.id;
              const esta = aqui ? visible(seleccion.inicio, duracion) : null;
              const colaInicio = aqui ? seleccion.inicio + duracion : 0;
              const post = aqui && postFranjas > 0 ? visible(colaInicio, postFranjas) : null;
              const recup = aqui && recupFranjas > 0 ? visible(colaInicio + postFranjas, recupFranjas) : null;
              const finde = [0, 6].includes(new Date(`${s.id}T00:00:00`).getDay());
              return (
                <div key={s.id} className={`as2-col${aqui ? ' as2-col-sel' : ''}${finde ? ' as2-col-finde' : ''}`} role="group" aria-label={diaCortoLabel(s.id)}>
                  {filas.map((i) => {
                    const enSeleccion = aqui && i >= seleccion.inicio && i < seleccion.inicio + duracion;
                    if (s.mapa[i] || enSeleccion) return null;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`as2-libre${i % 2 === 1 ? ' as2-media' : ''}${fueraDeJornada(i) ? ' as2-fuera' : ''}`}
                        style={{ gridRow: i - desde + 1 }}
                        aria-label={`${diaCortoLabel(s.id)}, ${horaFranja(i)}, libre`}
                        onClick={() => onElegir(s.id, i)}
                      />
                    );
                  })}

                  {post && (
                    <div className="as2-cola" style={{ gridRow: post.fila }}>
                      Postquirúrgico · {duracionLabel(postFranjas)}
                    </div>
                  )}
                  {recup && (
                    <div className="as2-cola" style={{ gridRow: recup.fila }}>
                      Recuperación · {duracionLabel(recupFranjas)}
                    </div>
                  )}

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
      <div className="as2-pie">
        <ul className="as2-leyenda" aria-label="Leyenda">
          <li><span className="as2-sw as2-sw-ocupado" aria-hidden="true"><LuCalendarCheck className="icon" /></span>Ocupado</li>
          <li><span className="as2-sw as2-sw-nd" aria-hidden="true"><LuWrench className="icon" /></span>No disponible</li>
          <li><span className="as2-sw as2-sw-esta" aria-hidden="true"><LuCircleCheck className="icon" /></span>Esta cirugía</li>
        </ul>
      </div>
    </section>
  );
}
