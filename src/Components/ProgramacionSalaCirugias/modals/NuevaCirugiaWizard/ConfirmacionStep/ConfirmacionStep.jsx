'use client';

import './ConfirmacionStep.css';
import {
  soloNombre, capitalizar, personalDeProcedimientos,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import Badge from '@/Components/Badge/Badge';
import Accordion from '@/Components/Accordion/Accordion';
import ProcedimientoCard from '../ProcedimientoCard/ProcedimientoCard';

// Paso 5 (último) del wizard "Nueva cirugía" -- resumen de solo lectura
// antes de "Guardar cirugía": procedimientos a realizar, insumos de la
// canasta (mismos datos que ProcedimientosStep/InsumosStep, ver
// datos.canasta/datos.insumos), equipos (Paso 4, ver
// EquiposStep.jsx) y personal que interviene (deduplicado entre
// procedimientos, ver personalDeProcedimientos en mockCirugiaData.js -- la
// misma función arma `personal` al guardar, ver armarCirugiaDesdeWizard).
// Cada bloque es un <Accordion> (expandir/contraer, con un resumen visible aun
// contraído); la canasta, la más larga, arranca contraída.
// Sin acciones -- si algo está mal, se vuelve al paso correspondiente vía el
// riel o "Atrás".
export default function ConfirmacionStep({ datos }) {
  const { procedimientos, equipos } = datos;
  const canasta = datos.canasta ?? null;
  const insumos = canasta ? (datos.insumos ?? []) : [];
  const personal = personalDeProcedimientos(procedimientos, datos.personal ?? []);

  return (
    <div className="cfs-step">
      <Accordion title={procedimientos.length === 1 ? 'Procedimiento a realizar' : 'Procedimientos a realizar'}>
        {procedimientos.length === 0 ? (
          <div className="ncw-step-empty">Aún no se han agregado procedimientos.</div>
        ) : (
          <div className="cfs-procs">
            {procedimientos.map((p, i) => (
              <ProcedimientoCard key={i} nombre={soloNombre(p.idCirugia)} tipo={capitalizar(p.tipoCirugia)} />
            ))}
          </div>
        )}
      </Accordion>

      <Accordion
        title="Canasta de insumos"
        meta={canasta ? `${insumos.length} insumos` : 'Sin vincular'}
        defaultOpen={false}
      >
        {!canasta ? (
          <div className="ncw-step-empty">
            Sin vincular. Podrás vincular una canasta después desde el detalle de la cirugía; mientras tanto no se podrán pedir insumos a farmacia.
          </div>
        ) : (
          <>
            <p className="cfs-canasta-nombre">{canasta.nombre}</p>
            {insumos.length === 0 ? (
              <div className="ncw-step-empty">La canasta no tiene insumos.</div>
            ) : (
              <div className="ncw-insumos-table-wrap">
                <table className="ncw-insumos-table">
                  <thead>
                    <tr><th>Id. Servicio</th><th>Insumo</th><th>Cantidad</th></tr>
                  </thead>
                  <tbody>
                    {insumos.map((ins) => (
                      <tr key={ins.codigo}>
                        <td className="cell-muted">{ins.codigo}</td>
                        <td className="cell-primary">{ins.nombre}</td>
                        <td className="cell-muted">{ins.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Accordion>

      <Accordion title="Equipos" meta={equipos.length === 0 ? 'Sin equipos' : `${equipos.length} equipos`}>
        {equipos.length === 0 ? (
          <div className="ncw-step-empty">Aún no se han agregado equipos.</div>
        ) : (
          <div className="ncw-insumos-table-wrap">
            <table className="ncw-insumos-table">
              <thead>
                <tr><th>Equipo</th><th>Tipo</th><th>Identificación</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e.identificacion}>
                    <td className="cell-primary">{e.nombre}</td>
                    <td className="cell-muted">{e.tipo}</td>
                    <td className="cell-muted">{e.identificacion}</td>
                    <td><Badge tone="success">Disponible</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Accordion>

      <Accordion title="Personal que interviene" meta={personal.length === 0 ? 'Sin personal' : `${personal.length} personas`}>
        {personal.length === 0 ? (
          <div className="ncw-step-empty">Aún no se han agregado procedimientos.</div>
        ) : (
          <ul className="cfs-personal-list">
            {personal.map((per) => (
              <li className="cfs-personal-item" key={`${per.rol}:${per.nombre}`}>
                <span className="cfs-personal-rol">{per.rol}</span>
                <span className="cfs-personal-nombre">{capitalizarNombre(per.nombre)}</span>
              </li>
            ))}
          </ul>
        )}
      </Accordion>
    </div>
  );
}
