import {
  LuCircleCheck, LuCircleX, LuClock, LuEye, LuFileText,
} from 'react-icons/lu';
import './PasoRevision.css';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import {
  ESTADO_GENERAL_LABEL, ESTADO_ITEM_LABEL, ITEMS, ITEM_LABEL, TONO_GENERAL, TONO_ITEM, accionItem,
} from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const ICONO_BANNER = { complete: LuCircleCheck, pending: LuClock, rejected: LuCircleX };

// Paso 4: vista previa de la lista de chequeo armada a partir de la historia
// clínica. `checklist` y `evaluacion` los calcula el orquestador.
export default function PasoRevision({
  checklist, evaluacion, onAccion, onVerDocumento,
}) {
  const tono = TONO_GENERAL[evaluacion.estado];
  const IconoBanner = ICONO_BANNER[tono];
  return (
    <div className="pv-wrap">
      <div>
        <h2 className="gc-card-titulo">Revisión</h2>
        <p className="gc-card-sub">Así queda la lista de chequeo de esta orden, armada a partir de la historia clínica.</p>
      </div>

      <div className={`pv-banner pv-${tono}`} role="status">
        <IconoBanner className="pv-banner-icono" aria-hidden="true" />
        <span className="pv-banner-texto">
          {ESTADO_GENERAL_LABEL[evaluacion.estado]} · <strong>{evaluacion.completos} de {evaluacion.total}</strong> obligatorios
        </span>
      </div>

      <ul className="pv-filas">
        {ITEMS.map((key) => {
          const item = checklist[key];
          const accion = accionItem(key, item.estado);
          // Orden y autorización con archivo ya cargado: se ve el documento en vez del aviso.
          const archivoNombre = item.archivoNombre ?? item.registro?.archivo?.nombre;
          const conDocumento = (key === 'orden' || key === 'autorizacion') && Boolean(item.archivoUrl);
          const obligatorio = item.obligatorio && item.estado !== 'no-requerido';
          return (
            <li key={key} className="pv-fila">
              <div className="pv-fila-top">
                <span className="pv-fila-nombre">{ITEM_LABEL[key]}</span>
                <EstadoChip tone={TONO_ITEM[item.estado]}>{ESTADO_ITEM_LABEL[item.estado]}</EstadoChip>
                <span className={`pv-req${obligatorio ? ' pv-req-obligatorio' : ''}`}>
                  {obligatorio ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>
              <p className="pv-detalle">{item.detalle}</p>
              {conDocumento && (
                <div className="pv-adjunto">
                  <LuFileText className="pv-adjunto-icono" aria-hidden="true" />
                  <span className="pv-adjunto-nombre">{archivoNombre}</span>
                  <button type="button" className="gc-link" onClick={() => onVerDocumento(key)}>
                    <LuEye className="icon" aria-hidden="true" />
                    {accion}
                  </button>
                </div>
              )}
              {accion && !conDocumento && (
                <button type="button" className="gc-link" onClick={() => onAccion(accion, ITEM_LABEL[key])}>
                  {accion}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
