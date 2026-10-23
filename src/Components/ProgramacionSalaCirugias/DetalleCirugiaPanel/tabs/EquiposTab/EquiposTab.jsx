'use client';

import './EquiposTab.css';
import Button from '@/Components/Button/Button';
import EquiposTable from '@/Components/EquiposTable/EquiposTable';
import SinVincular from '../../SinVincular/SinVincular';
import TabConPie from '../../TabConPie/TabConPie';
import { LuLink, LuStethoscope } from 'react-icons/lu';

// Sin equipos vinculados el vacío ofrece la acción principal para vincularlos
// (igual que Insumos con la canasta).
export default function EquiposTab({ cirugia, puedeAccionar, onVincular }) {
  if (cirugia.equipos.length === 0) {
    return (
      <SinVincular
        icon={LuStethoscope}
        title="Equipos sin vincular"
        text="Vincula los equipos que se usarán en la cirugía."
      >
        <Button icon={LuLink} disabled={!puedeAccionar} onClick={onVincular}>
          Vincular equipos
        </Button>
      </SinVincular>
    );
  }
  const total = cirugia.equipos.length;
  return (
    <TabConPie
      resumen={<><strong>{total}</strong> {total === 1 ? 'equipo vinculado' : 'equipos vinculados'}</>}
      accionLabel="Editar equipos"
      accionDeshabilitada={!puedeAccionar}
      onAccion={onVincular}
    >
      <EquiposTable equipos={cirugia.equipos} />
    </TabConPie>
  );
}
