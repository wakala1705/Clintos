import { LuCalendarClock, LuTriangleAlert } from 'react-icons/lu';
import './SeccionFechaSala.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { duracionLabel, rangoLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const DURACIONES = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: duracionLabel(i + 1) }));

// Resumen de la franja elegida + selector de duración estimada. Si la nueva
// duración no cabe donde está, el orquestador la reubica en la primera franja
// libre de la sala (y `aviso` lo comunica).
export default function SeccionFechaSala({
  fecha, sala, seleccion, duracion, onDuracion, aviso,
}) {
  return (
    <section className="gc-seccion" aria-labelledby="pc-fecha-sala">
      <h3 className="gc-seccion-titulo" id="pc-fecha-sala">Fecha y sala</h3>
      <div className="sf-resumen">
        <LuCalendarClock className="sf-icono" aria-hidden="true" />
        {seleccion ? (
          <span>
            <strong>{diaCortoLabel(fecha)}</strong> · {sala?.nombre} · {rangoLabel(seleccion.inicio, duracion)}
          </span>
        ) : (
          <span>Elige una franja libre en la agenda.</span>
        )}
      </div>
      <div className="form-field gc-form sf-duracion">
        <label htmlFor="pc-duracion">Duración estimada</label>
        <FormSelect
          id="pc-duracion"
          value={String(duracion)}
          onChange={(v) => onDuracion(Number(v))}
          options={DURACIONES}
        />
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
