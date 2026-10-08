import Badge from '@/Components/Badge/Badge';
import './OrigenTag.css';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

// El origen no es un estado: evita verde/ámbar/rojo (que en esta pantalla
// significan completo/pendiente/bloqueado) y el gris (se leía como
// deshabilitado). `className` pinta el violeta/celeste en OrigenTag.css, que
// <Badge> no trae como tono.
const TONOS = { 'consulta-externa': 'neutral', internacion: 'info' };
const CLASES = { 'consulta-externa': 'ot-violeta', internacion: '' };

// Etiqueta del origen de la orden: solo texto; el color es apoyo.
export default function OrigenTag({ origen }) {
  return (
    <Badge tone={TONOS[origen]} className={CLASES[origen]}>
      {ORIGEN_LABEL[origen]}
    </Badge>
  );
}
