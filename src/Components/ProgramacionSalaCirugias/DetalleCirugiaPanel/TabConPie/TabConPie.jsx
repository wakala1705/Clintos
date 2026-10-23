import './TabConPie.css';
import Button from '@/Components/Button/Button';
import { LuPencil } from 'react-icons/lu';

// Tab del detalle de la cirugía con su contenido (`children`, una tabla que
// scrollea) y un pie fijo: el resumen a la izquierda y la acción de editar a la
// derecha, mismo esquema que el pie de Insumos. Lo usan Personal clínico y Equipos.
export default function TabConPie({
  resumen, accionLabel, onAccion, accionDeshabilitada = false, children,
}) {
  return (
    <div className="tcp-tab">
      <div className="tcp-body">{children}</div>
      <div className="tcp-footer">
        <span className="tcp-resumen">{resumen}</span>
        <Button variant="secondary-accent" icon={LuPencil} disabled={accionDeshabilitada} onClick={onAccion}>
          {accionLabel}
        </Button>
      </div>
    </div>
  );
}
