'use client';

import './ProgresoVerificacion.css';

// Avance de la verificación de la recepción: texto + barra. `conDiferencia` =
// insumos con diferencia todavía sin verificar (hay que revisarlos uno a uno).
// Vive en el footer de la pestaña (.cnc-footer-msg) para no quitarle alto a la tabla.
export default function ProgresoVerificacion({ verificados, total, conDiferencia = 0 }) {
  const pct = total === 0 ? 0 : Math.round((verificados / total) * 100);
  return (
    <div className="cnc-progreso">
      <div className="cnc-progreso-texto">
        <span><strong>{verificados} de {total}</strong> insumos verificados</span>
        {conDiferencia > 0 && (
          <span className="cnc-progreso-dif">
            {conDiferencia === 1 ? '1 con diferencia: verifícalo aparte' : `${conDiferencia} con diferencia: verifícalos uno a uno`}
          </span>
        )}
      </div>
      <div
        className="cnc-progreso-barra"
        role="progressbar"
        aria-label="Insumos verificados"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={verificados}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
