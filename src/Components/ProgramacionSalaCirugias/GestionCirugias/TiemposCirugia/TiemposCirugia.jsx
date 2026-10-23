import { useEffect, useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './TiemposCirugia.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { MINUTOS_FRANJA } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { DURACIONES_CIRUGIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const etiqueta = (min) => (min >= 60 && min % 60 === 0 ? `${min / 60} h` : `${min} min`);
// El valor del select son minutos.
const DURACIONES = DURACIONES_CIRUGIA_CATALOGO.map((min) => ({ value: String(min), label: etiqueta(min) }));

// Tarjeta "Tiempos" de la columna izquierda del modal; el aviso va debajo de los campos.
// La estimada (en franjas) mueve el
// bloque; si no cabe donde está, el modal la reubica y `aviso` lo comunica.
export default function TiemposCirugia({
  duracion, onDuracion, aviso,
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
