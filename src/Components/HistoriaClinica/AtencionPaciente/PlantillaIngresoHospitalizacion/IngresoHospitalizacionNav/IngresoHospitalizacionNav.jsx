'use client';

import './IngresoHospitalizacionNav.css';

// Nav lateral de las 4 secciones del formulario — mismo patrón estructural
// que AntecedentesNav.jsx (PlantillaCrecimt2: rail izquierdo + contenido a
// la derecha, ver PlantillaIngresoHospitalizacion.jsx), simplificado sin
// numeración/checkmarks de completado ni subsecciones: esta plantilla no
// tiene navegación bloqueante ni scrollspy, cada sección es una card plana
// (ver AGENTS.md, encargo explícito de replicar "el mismo patrón que en las
// plantillas de consulta externa").
export default function IngresoHospitalizacionNav({ secciones, activeSeccion, onSelectSeccion }) {
  return (
    <nav className="pihn-nav" aria-label="Secciones del ingreso a hospitalización">
      <ul className="pihn-list">
        {secciones.map((seccion) => {
          const isCurrent = seccion.id === activeSeccion;
          return (
            <li key={seccion.id}>
              <button
                type="button"
                className={`pihn-item${isCurrent ? ' current' : ''}`}
                onClick={() => onSelectSeccion(seccion.id)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {seccion.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
