import { LuBedDouble, LuFileInput, LuStethoscope } from 'react-icons/lu';
import './OrigenTag.css';
import Badge from '@/Components/Badge/Badge';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

const ICONOS = {
  'consulta-externa': LuStethoscope,
  internacion: LuBedDouble,
  externa: LuFileInput,
};
// El origen no es un estado: evita verde/ámbar/rojo (que en esta pantalla
// significan completo/pendiente/bloqueado) y el gris (se leía como
// deshabilitado). `className` pinta el violeta/celeste en OrigenTag.css, que
// <Badge> no trae como tono.
const TONOS = { 'consulta-externa': 'neutral', internacion: 'info', externa: 'neutral' };
const CLASES = { 'consulta-externa': 'ot-violeta', internacion: '', externa: 'ot-celeste' };

// Etiqueta del origen de la orden: siempre texto (+ ícono); el color es solo
// apoyo.
export default function OrigenTag({ origen }) {
  const Icono = ICONOS[origen];
  return (
    <Badge tone={TONOS[origen]} className={CLASES[origen]}>
      <Icono className="ot-icon" aria-hidden="true" />
      {ORIGEN_LABEL[origen]}
    </Badge>
  );
}
