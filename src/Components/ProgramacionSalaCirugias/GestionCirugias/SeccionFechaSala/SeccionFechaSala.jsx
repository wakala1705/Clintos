import { LuCalendarClock, LuTriangleAlert } from 'react-icons/lu';
import './SeccionFechaSala.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { MINUTOS_FRANJA, rangoLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { DURACIONES_CIRUGIA_CATALOGO, diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const etiqueta = (min) => (min >= 60 && min % 60 === 0 ? `${min / 60} h` : `${min} min`);
// Mismo catálogo para las tres duraciones; el valor del select son minutos.
const DURACIONES = DURACIONES_CIRUGIA_CATALOGO.map((min) => ({ value: String(min), label: etiqueta(min) }));

// Resumen de la franja elegida + duración estimada. Si la nueva duración no
// cabe donde está, el modal la reubica en la primera franja libre y `aviso`
// lo comunica.
export default function SeccionFechaSala({
  fecha, sala, seleccion, duracion, onDuracion, post, onPost, recuperacion, onRecuperacion, aviso,
}) {
  return (
    <section className="gc-seccion gc-form" aria-labelledby="pc-fecha-sala">
      <h3 className="gc-seccion-titulo" id="pc-fecha-sala">Fecha y sala</h3>
      <div className="sf-resumen">
        <LuCalendarClock className="sf-icono" aria-hidden="true" />
        {seleccion ? (
          <span>
            <strong>{sala?.nombre} · {diaCortoLabel(fecha)}</strong>
            <span className="sf-hora">{rangoLabel(seleccion.inicio, duracion)}</span>
          </span>
        ) : (
          <span>Elige una franja libre en la agenda.</span>
        )}
      </div>
      <div className="sf-duraciones">
        <div className="form-field">
          <label htmlFor="pc-duracion">Dur. estimada</label>
          <FormSelect
            id="pc-duracion"
            value={String(duracion * MINUTOS_FRANJA)}
            onChange={(v) => onDuracion(Number(v) / MINUTOS_FRANJA)}
            options={DURACIONES}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pc-dur-post">Dur. postquirúrgica</label>
          <FormSelect id="pc-dur-post" value={String(post)} onChange={(v) => onPost(Number(v))} options={DURACIONES} />
        </div>
        <div className="form-field">
          <label htmlFor="pc-dur-recuperacion">Dur. recuperación</label>
          <FormSelect
            id="pc-dur-recuperacion"
            value={String(recuperacion)}
            onChange={(v) => onRecuperacion(Number(v))}
            options={DURACIONES}
          />
        </div>
      </div>
      {aviso && (
        <p className="sf-aviso" role="status">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}
    </section>
  );
}
