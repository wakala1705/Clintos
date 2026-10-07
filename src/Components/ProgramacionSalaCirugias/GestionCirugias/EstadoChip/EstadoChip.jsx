import {
  LuCircleCheck, LuCircleX, LuClock, LuMinus,
} from 'react-icons/lu';
import './EstadoChip.css';
import Badge from '@/Components/Badge/Badge';

const ICONOS = {
  complete: LuCircleCheck,
  pending: LuClock,
  rejected: LuCircleX,
  notrequired: LuMinus,
};

// Tono de <Badge> de cada estado clinical-status.
const TONOS_BADGE = {
  complete: 'success',
  pending: 'warn',
  rejected: 'danger',
  notrequired: 'neutral',
};

// Chip de estado clinical-status de la lista de chequeo: <Badge> + ícono +
// texto, para que el estado nunca dependa solo del color. `tone` es
// complete | pending | rejected | notrequired (ver TONO_ITEM/TONO_GENERAL en
// @/hooks/ProgramacionSalaCirugias/gestion/gestion). `mini` es la versión
// compacta de la columna Estudios (Lab / Img); como su texto visible es una
// abreviatura, `srLabel` trae el nombre completo para lectores de pantalla.
export default function EstadoChip({
  tone, children, mini = false, srLabel,
}) {
  const Icono = ICONOS[tone];
  return (
    <Badge tone={TONOS_BADGE[tone]} className={`ec-chip${mini ? ' ec-mini' : ''}`}>
      <Icono className="ec-icon" aria-hidden="true" />
      {srLabel ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="ec-sr">{srLabel}</span>
        </>
      ) : children}
    </Badge>
  );
}
