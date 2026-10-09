'use client';

import './ConfirmacionStep.css';
import {
  soloNombre, capitalizar, personalDeProcedimientos,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import Badge from '@/Components/Badge/Badge';

// Paso 5 (último) del wizard "Nueva cirugía" -- resumen de solo lectura
// antes de "Guardar cirugía": procedimientos a realizar, insumos de la
// canasta (mismos datos que ProcedimientosStep/InsumosStep, ver
// datos.canasta/datos.insumos), equipos (Paso 4, ver
// EquiposStep.jsx) y personal que interviene (deduplicado entre
// procedimientos, ver personalDeProcedimientos en mockCirugiaData.js -- la
// misma función arma `personal` al guardar, ver armarCirugiaDesdeWizard).
// Sin acciones -- si algo está mal, se vuelve al paso correspondiente vía el
// riel o "Atrás".
export default function ConfirmacionStep({ datos }) {
  const { procedimientos, equipos } = datos;
  const canasta = datos.canasta ?? null;
  const insumos = canasta ? (datos.insumos ?? []) : [];
  const personal = personalDeProcedimientos(procedimientos, datos.personal ?? []);

  return (
    <div className="cfs-step">
      <section className="cfs-section">
        <h4 className="ncw-section-title">Procedimiento a realizar</h4>
        {procedimientos.length === 0 ? (
          <div className="ncw-step-empty">Aún no se han agregado procedimientos.</div>
        ) : (
          <ul className="cfs-procedimientos-list">
            {procedimientos.map((p, i) => (
              <li className="cfs-procedimiento-item" key={i}>
                <span className="cfs-procedimiento-nombre">{soloNombre(p.idCirugia)}</span>
                <span className="cfs-procedimiento-tipo">{capitalizar(p.tipoCirugia)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cfs-section">
        <h4 className="ncw-section-title">
          {canasta ? `Canasta: ${canasta.nombre}` : 'Canasta de insumos'}
        </h4>
        {!canasta ? (
          <div className="ncw-step-empty">
            Sin vincular. Podrás vincular una canasta después desde el detalle de la cirugía; mientras tanto no se podrán pedir insumos a farmacia.
          </div>
        ) : insumos.length === 0 ? (
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
      </section>

      <section className="cfs-section">
        <h4 className="ncw-section-title">Equipos</h4>
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
      </section>

      <section className="cfs-section">
        <h4 className="ncw-section-title">Personal que interviene</h4>
        {personal.length === 0 ? (
          <div className="ncw-step-empty">Aún no se han agregado procedimientos.</div>
        ) : (
          <ul className="cfs-personal-list">
            {personal.map((per) => (
              <li className="cfs-personal-item" key={`${per.rol}:${per.nombre}`}>
                <span className="cfs-personal-rol">{per.rol}</span>
                <span className="cfs-personal-nombre">{per.nombre}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
