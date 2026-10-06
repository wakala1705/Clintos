import {
  LuCircleCheck, LuCircleX, LuClock, LuMinus,
} from 'react-icons/lu';
import './EstadoChip.css';

const ICONOS = {
  complete: LuCircleCheck,
  pending: LuClock,
  rejected: LuCircleX,
  notrequired: LuMinus,
};

// Chip de estado clinical-status de la lista de chequeo: tono (color) + ícono
// + texto, para que el estado nunca dependa solo del color. `tone` es
// complete | pending | rejected | notrequired (ver TONO_ITEM/TONO_GENERAL en
// @/hooks/ProgramacionSalaCirugias/gestion/gestion). `mini` es la versión
// compacta de la columna Estudios (Lab / Img); como su texto visible es una
// abreviatura, `srLabel` trae el nombre completo para lectores de pantalla.
export default function EstadoChip({
  tone, children, mini = false, srLabel,
}) {
  const Icono = ICONOS[tone];
  return (
    <span className={`ec-chip ec-${tone}${mini ? ' ec-mini' : ''}`}>
      <Icono className="ec-icon" aria-hidden="true" />
      {srLabel ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="ec-sr">{srLabel}</span>
        </>
      ) : children}
    </span>
  );
}
