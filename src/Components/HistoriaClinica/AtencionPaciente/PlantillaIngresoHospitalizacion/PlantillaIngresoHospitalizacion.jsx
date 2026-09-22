'use client';

import './PlantillaIngresoHospitalizacion.css';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuArrowLeft, LuClipboardPlus } from 'react-icons/lu';

// Plantilla "Ingreso a hospitalización" (INGHOSP), abierta desde "Nueva
// atención" → catálogo de plantillas (ver PlantillaModal en
// AtencionPaciente.jsx) — mismo patrón que PlantillaCrecimt2 (se monta
// DENTRO de la card de AtencionPaciente.jsx en vez de ser una ruta propia,
// ver su comentario para el porqué). El formulario en sí todavía no está
// definido (encargo explícito: "por ahora solo habilita la pantalla cuando
// selecciono la plantilla") — este componente es solo el disparador +
// shell mínimo, para no bloquear el resto del flujo (selección de
// plantilla, salir, banner) mientras se define el formulario real.
export default function PlantillaIngresoHospitalizacion({ onSalir }) {
  return (
    <>
      <div className="pih-titlebar">
        <button type="button" className="pih-titlebar-back" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <span className="pih-titlebar-title">Ingreso a hospitalización</span>
      </div>

      <div className="pih-body">
        <AgendaEmptyState
          icon={LuClipboardPlus}
          title="Formulario en construcción"
          subtitle="El formulario de ingreso a hospitalización todavía no está definido. Por ahora esta pantalla solo confirma que la plantilla se activa correctamente."
        />
      </div>
    </>
  );
}
