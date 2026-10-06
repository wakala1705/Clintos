import { LuBedDouble, LuFileInput, LuStethoscope } from 'react-icons/lu';
import './OrigenTag.css';
import Badge from '@/Components/Badge/Badge';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

const ICONOS = {
  'consulta-externa': LuStethoscope,
  internacion: LuBedDouble,
  externa: LuFileInput,
};
const TONOS = { 'consulta-externa': 'neutral', internacion: 'info', externa: 'neutral' };

// Etiqueta del origen de la orden: siempre texto (+ ícono); el tono de
// <Badge> es solo apoyo.
export default function OrigenTag({ origen }) {
  const Icono = ICONOS[origen];
  return (
    <Badge tone={TONOS[origen]}>
      <Icono className="ot-icon" aria-hidden="true" />
      {ORIGEN_LABEL[origen]}
    </Badge>
  );
}
