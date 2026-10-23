'use client';

import './PersonalTab.css';
import Button from '@/Components/Button/Button';
import SinVincular from '../../SinVincular/SinVincular';
import TabConPie from '../../TabConPie/TabConPie';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { LuLink, LuUsers } from 'react-icons/lu';

// Sin nadie asignado (la cirugía se programó sin elegir personal en el wizard) no hay
// tabla que mostrar: el vacío ofrece la acción principal para vincularlo, igual que Insumos.
// Con personal, el pie ofrece "Editar personal" (`onVincular` abre el mismo modal, ya cargado).
export default function PersonalTab({ cirugia, puedeAccionar, onVincular }) {
  if (cirugia.personal.length === 0) {
    return (
      <SinVincular
        icon={LuUsers}
        title="Personal sin vincular"
        text="Vincula al personal clínico que participará en la cirugía."
      >
        <Button icon={LuLink} disabled={!puedeAccionar} onClick={onVincular}>
          Vincular personal
        </Button>
      </SinVincular>
    );
  }
  const total = cirugia.personal.length;
  return (
    <TabConPie
      resumen={<><strong>{total}</strong> {total === 1 ? 'persona vinculada' : 'personas vinculadas'}</>}
      accionLabel="Editar personal"
      accionDeshabilitada={!puedeAccionar}
      onAccion={onVincular}
    >
      <table className="pst-table">
        <thead>
          <tr><th>Nombre</th><th>Rol</th></tr>
        </thead>
        <tbody>
          {cirugia.personal.map((p) => (
            <tr key={`${p.rol}-${p.nombre}`}>
              <td className="cell-primary">{capitalizarNombre(p.nombre)}</td>
              <td className="cell-muted">{p.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TabConPie>
  );
}
