import './InfoTooltip.css';
import { LuInfo } from 'react-icons/lu';

// Ícono "i" con burbuja al hover/foco (encargo, sección 18) — mismo patrón
// .tooltip-wrap/.tooltip-bubble ya establecido en ArticulosModal.css
// (SolicitudConsumo), replicado acá con su propio nombre por feature-folder
// en vez de un import cruzado (mismo criterio que .cbs-tooltip en
// GestionCamasSidebar.css).
export default function InfoTooltip({ texto }) {
  return (
    <span className="cbin-tooltip-wrap" tabIndex={0}>
      <LuInfo className="icon cbin-tooltip-icon" aria-hidden="true" />
      <span className="cbin-tooltip-bubble" role="tooltip">{texto}</span>
    </span>
  );
}
