import { LuCheck } from 'react-icons/lu';
import './Stepper.css';

// Stepper horizontal. Los pasos ya completados son botones para volver atrás;
// el actual lleva aria-current="step"; los siguientes no son accionables.
export default function Stepper({ pasos, actual, onIr }) {
  return (
    <ol className="st-lista" aria-label="Pasos del registro de la orden">
      {pasos.map((nombre, i) => {
        const n = i + 1;
        const estado = n < actual ? 'hecho' : n === actual ? 'actual' : 'pendiente';
        const contenido = (
          <>
            <span className="st-num" aria-hidden="true">
              {estado === 'hecho' ? <LuCheck className="icon" /> : n}
            </span>
            <span className="st-nombre">
              <span className="st-sr">{`Paso ${n}: `}</span>{nombre}
              {estado === 'hecho' && <span className="st-sr"> (completado)</span>}
            </span>
          </>
        );
        return (
          <li key={nombre} className={`st-paso st-${estado}`} aria-current={estado === 'actual' ? 'step' : undefined}>
            {estado === 'hecho' ? (
              <button type="button" className="st-btn" onClick={() => onIr(n)}>{contenido}</button>
            ) : (
              <div className="st-btn st-estatico">{contenido}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
