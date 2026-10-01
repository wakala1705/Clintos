'use client';

import { LuTriangleAlert, LuX } from 'react-icons/lu';
import './ErroresCierreBar.css';

// Barra fija de errores de cierre: vive fuera del cuerpo que scrollea.
// `errores`: [{ mensaje, navId }] — navId es la entrada del índice a la que lleva el botón.
export default function ErroresCierreBar({ errores, onIr, onDescartar }) {
  if (!errores?.length) return null;
  return (
    <div className="hgq-errbar" role="alert">
      <div className="hgq-errbar-head">
        <LuTriangleAlert className="icon" aria-hidden="true" />
        <strong>No se puede cerrar la hoja</strong>
        <span className="hgq-errbar-count">{errores.length}</span>
        <button type="button" className="hgq-errbar-x" aria-label="Descartar errores" onClick={onDescartar}>
          <LuX className="icon" aria-hidden="true" />
        </button>
      </div>
      <ul className="hgq-errbar-list">
        {errores.map((e) => (
          <li key={e.mensaje}>
            <button type="button" className="hgq-errbar-link" onClick={() => onIr?.(e.navId)}>{e.mensaje}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
