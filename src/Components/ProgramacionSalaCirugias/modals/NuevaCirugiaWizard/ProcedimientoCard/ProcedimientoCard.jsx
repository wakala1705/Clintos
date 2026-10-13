import { LuScissors } from 'react-icons/lu';
import './ProcedimientoCard.css';

// Tarjeta de un procedimiento de la cirugía en el wizard "Nueva cirugía": la
// misma en el Paso 2 (Personal, con sus insumos precargados como `children`) y
// en el Paso 3 (Insumos, solo como contexto de la canasta).
export default function ProcedimientoCard({ nombre, tipo, children }) {
  return (
    <div className="pcc-card">
      <div className="pcc-heading">
        <span className="pcc-icon" aria-hidden="true"><LuScissors className="icon" /></span>
        <div className="pcc-text">
          <span className="pcc-nombre">{nombre}</span>
          {tipo && <span className="pcc-tipo">{tipo}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}
