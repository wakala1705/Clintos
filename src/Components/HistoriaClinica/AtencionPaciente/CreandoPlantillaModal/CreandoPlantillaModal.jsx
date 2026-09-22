'use client';

import './CreandoPlantillaModal.css';
import { LuLoaderCircle } from 'react-icons/lu';

// Modal chico de carga entre elegir una plantilla y montarla (ver
// CREAR_PLANTILLA_DELAY_MS/handleElegirPlantilla en AtencionPaciente.jsx) --
// un único punto de delay/loading en el padre común, disparado tanto desde
// el catálogo (PlantillaModal, "Elegir") como desde la acción rápida "+" de
// un agrupador (handleAgregarRegistro), en vez de que cada disparador simule
// su propio delay por separado (encargo explícito: "ese mismo modal debería
// dispararse cuando creo una plantilla desde la acción rápida del
// agrupador"). Mismo diseño que PrintLoadingModal (Facturación, encargo
// explícito: "utiliza el pequeño modal de carga que utilizamos al imprimir
// una factura") -- no reutilizado directo (feature distinta, con sus propias
// clases `.fvc-*`/`.modal`, ver AGENTS.md "Component organization"),
// replicado acá sobre `.modal-card` de HistoriaClinica. Sin fila de título/
// cerrar ni forma de cancelarlo (mismo criterio que esa referencia): se
// autodesmonta cuando el padre corta el timeout.
export default function CreandoPlantillaModal({ plantilla }) {
  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-card cpm-card"
        role="alertdialog"
        aria-modal="true"
        aria-label={`Creando plantilla ${plantilla.descripcion}`}
      >
        <LuLoaderCircle className="icon cpm-spinner" aria-hidden="true" />
        <p className="cpm-text">Creando plantilla...</p>
        <span className="cpm-sub">{plantilla.descripcion}</span>
      </div>
    </div>
  );
}
