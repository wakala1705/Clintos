import { LuPlus } from 'react-icons/lu';
import './SeccionEquipos.css';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import { disponibilidad } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

// Equipos como checkboxes reales, con su disponibilidad en el horario elegido.
export default function SeccionEquipos({
  equipos, elegidos, onToggle, onAgregar, seleccion, duracion,
}) {
  return (
    <section className="gc-seccion" aria-labelledby="pc-equipos">
      <h3 className="gc-seccion-titulo" id="pc-equipos">Equipos</h3>
      <ul className="seq-lista">
        {equipos.map((e) => {
          const cruce = seleccion && disponibilidad(e.ocupado, seleccion.inicio, duracion) === 'cruce';
          const marcado = elegidos.has(e.id);
          return (
            <li key={e.id}>
              <label className={`seq-fila${marcado ? ' selected' : ''}`}>
                <input type="checkbox" checked={marcado} onChange={() => onToggle(e.id)} />
                <span className="seq-nombre">{e.nombre}</span>
                {cruce
                  ? <EstadoChip tone="rejected">No disponible en el horario</EstadoChip>
                  : <EstadoChip tone="complete">Disponible</EstadoChip>}
              </label>
            </li>
          );
        })}
      </ul>
      <button type="button" className="gc-link seq-agregar" onClick={onAgregar}>
        <LuPlus className="icon" aria-hidden="true" />
        Agregar equipo
      </button>
    </section>
  );
}
