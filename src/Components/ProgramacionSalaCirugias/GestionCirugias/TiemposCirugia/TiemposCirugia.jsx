import { LuTriangleAlert } from 'react-icons/lu';
import './TiemposCirugia.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { MINUTOS_FRANJA, duracionLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { DURACIONES_CIRUGIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const etiqueta = (min) => (min >= 60 && min % 60 === 0 ? `${min / 60} h` : `${min} min`);
// Mismo catálogo para las tres duraciones; el valor del select son minutos.
const DURACIONES = DURACIONES_CIRUGIA_CATALOGO.map((min) => ({ value: String(min), label: etiqueta(min) }));

// Tiempos de la cirugía, junto a la agenda. La estimada (en franjas) mueve el
// bloque; si no cabe donde está, el modal la reubica y `aviso` lo comunica.
export default function TiemposCirugia({
  duracion, onDuracion, post, onPost, recuperacion, onRecuperacion, aviso,
}) {
  return (
    <div className="tc">
      <div className="tc-fila gc-form" role="group" aria-label="Tiempos de la cirugía">
        <span className="tc-titulo">Tiempos</span>
        <div className="tc-campo">
          <label htmlFor="pc-duracion">Estimada</label>
          <FormSelect
            id="pc-duracion"
            value={String(duracion * MINUTOS_FRANJA)}
            onChange={(v) => onDuracion(Number(v) / MINUTOS_FRANJA)}
            options={DURACIONES}
          />
        </div>
        <div className="tc-campo">
          <label htmlFor="pc-dur-post">Postquirúrgica</label>
          <FormSelect id="pc-dur-post" value={String(post)} onChange={(v) => onPost(Number(v))} options={DURACIONES} />
        </div>
        <div className="tc-campo">
          <label htmlFor="pc-dur-recuperacion">Recuperación</label>
          <FormSelect
            id="pc-dur-recuperacion"
            value={String(recuperacion)}
            onChange={(v) => onRecuperacion(Number(v))}
            options={DURACIONES}
          />
        </div>
        <p className="tc-total">
          Total del proceso: <strong>{duracionLabel(duracion + (post + recuperacion) / MINUTOS_FRANJA)}</strong>
        </p>
      </div>
      {aviso && (
        <p className="tc-aviso" role="status">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}
    </div>
  );
}
