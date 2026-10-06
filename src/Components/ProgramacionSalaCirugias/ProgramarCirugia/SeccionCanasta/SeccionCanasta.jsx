import { LuInfo, LuPackage } from 'react-icons/lu';
import './SeccionCanasta.css';
import Button from '@/Components/Button/Button';

// Plantilla de insumos y medicamentos según el CUPS. Las cantidades son
// placeholders; "Ver y ajustar" abriría el detalle de la canasta.
export default function SeccionCanasta({ procedimiento, onVerAjustar }) {
  return (
    <section className="gc-seccion" aria-labelledby="pc-canasta">
      <h3 className="gc-seccion-titulo" id="pc-canasta">Canasta</h3>
      <div className="scn-card">
        <LuPackage className="scn-icono" aria-hidden="true" />
        <div className="scn-info">
          <span className="scn-nombre">Canasta · {procedimiento}</span>
          <span className="scn-sub">[Código canasta] · [N] insumos · [N] medicamentos</span>
        </div>
        <Button variant="secondary" className="scn-btn" onClick={onVerAjustar}>Ver y ajustar</Button>
      </div>
      <p className="gc-aviso">
        <LuInfo className="icon" aria-hidden="true" />
        <span>Al programar, la solicitud de canasta se envía a farmacia para su dispensación.</span>
      </p>
    </section>
  );
}
