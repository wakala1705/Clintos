'use client';

import './IngresoHospitalizacionNav.css';

// Nav lateral de las 4 secciones del formulario — mismo patrón estructural
// que AntecedentesNav.jsx (PlantillaCrecimt2: rail izquierdo + contenido a
// la derecha), simplificado sin numeración/checkmarks de completado ni
// subsecciones: esta plantilla no tiene navegación bloqueante (sin
// validación entre secciones), pero sí es scrollspy -- `onSelectSeccion`
// hace scroll hasta la sección elegida y `activeSeccion` se resalta solo
// según cuál sección cruzó el techo del panel al scrollear a mano (ver
// PlantillaIngresoHospitalizacion.jsx, encargo explícito: "un solo
// formulario" con las 4 secciones siempre visibles en vez de mostrar/ocultar
// una a la vez).
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
