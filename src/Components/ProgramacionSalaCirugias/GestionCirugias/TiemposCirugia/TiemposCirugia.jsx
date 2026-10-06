import { useEffect, useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './TiemposCirugia.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { MINUTOS_FRANJA, duracionLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { DURACIONES_CIRUGIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const etiqueta = (min) => (min >= 60 && min % 60 === 0 ? `${min / 60} h` : `${min} min`);
// Mismo catálogo para las tres duraciones; el valor del select son minutos.
const DURACIONES = DURACIONES_CIRUGIA_CATALOGO.map((min) => ({ value: String(min), label: etiqueta(min) }));

// Tarjeta "Tiempos" de la columna izquierda del modal; el aviso va debajo de los campos.
// La estimada (en franjas) mueve el
// bloque; si no cabe donde está, el modal la reubica y `aviso` lo comunica.
export default function TiemposCirugia({
  duracion, onDuracion, post, onPost, recuperacion, onRecuperacion, aviso,
}) {
  const avisoRef = useRef(null);
  // La columna tiene scroll propio: el aviso se trae a la vista al aparecer.
  useEffect(() => { avisoRef.current?.scrollIntoView({ block: 'nearest' }); }, [aviso]);
  return (
    <section className="tc" aria-labelledby="tc-titulo">
      <h3 className="tc-titulo" id="tc-titulo">Tiempos</h3>
      <div className="tc-fila gc-form">
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
        <div className="tc-campo tc-total">
          <span className="tc-etiqueta">Total del proceso</span>
          <strong>{duracionLabel(duracion + (post + recuperacion) / MINUTOS_FRANJA)}</strong>
        </div>
      </div>
      {aviso && (
        <p ref={avisoRef} className="tc-aviso" role="status">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}
    </section>
  );
}
