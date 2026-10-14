'use client';

import { LuPlus } from 'react-icons/lu';
import './Excepciones.css';
import Button from '@/Components/Button/Button';
import ExcepcionItem from '../ExcepcionItem/ExcepcionItem';
import { ordenarExcepciones } from '@/hooks/AgendaCirujanos/excepciones';

// Pestaña "Excepciones": bloqueos y aperturas puntuales que prevalecen sobre
// el horario semanal. Se guardan al instante (no hay borrador); la advertencia
// de cirugías en conflicto la maneja EditorAgenda antes de llamar a `onAgregar`
// / `onEliminar`.
export default function Excepciones({
  excepciones, hoy, onAgregar, onEliminar,
}) {
  return (
    <div>
      <div className="ac-exc-top">
        <p>Bloqueos y aperturas puntuales que prevalecen sobre el horario semanal.</p>
        <Button size="sm" icon={LuPlus} onClick={onAgregar}>Agregar excepción</Button>
      </div>

      {excepciones.length === 0 ? (
        <div className="ac-exc-vacio">
          Aún no hay excepciones. Agrega un bloqueo por vacaciones, congreso o permiso, o una apertura extra.
        </div>
      ) : (
        <ul className="ac-exc-lista">
          {ordenarExcepciones(excepciones).map((x) => (
            <li key={x.id}>
              <ExcepcionItem excepcion={x} pasada={x.hasta < hoy} onEliminar={() => onEliminar(x.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
