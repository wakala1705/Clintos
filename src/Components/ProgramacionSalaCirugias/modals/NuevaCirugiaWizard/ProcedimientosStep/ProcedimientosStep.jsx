'use client';

import { useState } from 'react';
import './ProcedimientosStep.css';
import Button from '@/Components/Button/Button';
import AgregarProcedimientoModal from './AgregarProcedimientoModal/AgregarProcedimientoModal';
import { soloNombre, capitalizar } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronDown, LuPlus, LuTrash2 } from 'react-icons/lu';

// Paso 2 del wizard "Nueva cirugía" -- lista los procedimientos agregados
// vía AgregarProcedimientoModal (`datos.procedimientos`, ver datosIniciales
// en NuevaCirugiaWizard.jsx) más el botón que abre ese modal. Sin
// paginación/búsqueda (a diferencia de InformacionGeneralStep no hay
// catálogo acá, es la lista propia de la cirugía que se está armando) --
// se espera un puñado de filas por cirugía, no un listado largo. Cada
// procedimiento es un bloque de 2 filas (encargo explícito) en vez de una
// fila de tabla con 4 columnas: arriba el nombre del procedimiento con el
// tipo de cirugía debajo (capitalizado, ver capitalizar() en
// mockCirugiaData.js -- llega en mayúsculas del catálogo, encargo explícito,
// como una etiqueta descriptiva del nombre y no un dato de formulario
// aparte), abajo
// Médico/Anestesiólogo en 2 columnas separadas (antes un solo bloque
// "Personal" con ambos nombres apilados).
export default function ProcedimientosStep({
  datos, onChange, patient,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  // Índices (dentro de `procedimientos`) cuya card de insumos está expandida
  // -- arranca vacío (todas colapsadas, progressive disclosure, mismo
  // criterio que los rangos de EadDomainEtapa.jsx). Reindexado a mano en
  // handleRemove para que quitar una card del medio no deje expandida la
  // card equivocada.
  const [expandedInsumos, setExpandedInsumos] = useState(() => new Set());
  const procedimientos = datos.procedimientos;

  function handleAdd(procedimiento) {
    onChange('procedimientos', [...procedimientos, procedimiento]);
    setModalAbierto(false);
  }

  function handleRemove(index) {
    onChange('procedimientos', procedimientos.filter((_, i) => i !== index));
    setExpandedInsumos((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  function toggleInsumos(index) {
    setExpandedInsumos((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

  return (
    <div className="pcs-step">
      <h4 className="ncw-section-title">Procedimientos asociados</h4>

      {procedimientos.length === 0 ? (
        <div className="ncw-step-empty">Aún no se han agregado procedimientos.</div>
      ) : (
        <div className="pcs-table">
          <div className="pcs-list">
            {procedimientos.map((p, i) => (
              <div className="pcs-card" key={i}>
                <div className="pcs-card-top">
                  <div className="pcs-card-heading">
                    <span className="pcs-cell-primary">{soloNombre(p.idCirugia)}</span>
                    <span className="pcs-card-tipo">{capitalizar(p.tipoCirugia)}</span>
                  </div>
                  <button
                    type="button"
                    className="ncw-icon-btn ncw-icon-btn-danger"
                    onClick={() => handleRemove(i)}
                    aria-label={`Quitar procedimiento ${soloNombre(p.idCirugia)}`}
                    title="Quitar procedimiento"
                  >
                    <LuTrash2 className="icon" />
                  </button>
                </div>
                <div className="pcs-card-bottom">
                  <div className="pcs-card-field">
                    <span className="pcs-card-label">Médico</span>
                    <span className="pcs-card-value">{soloNombre(p.idCirujano)}</span>
                  </div>
                  <div className="pcs-card-field">
                    <span className="pcs-card-label">Anestesiólogo</span>
                    <span className="pcs-card-value">{soloNombre(p.idAnestesiologo)}</span>
                  </div>
                </div>

                {p.insumos?.length > 0 && (
                  <div className="pcs-insumos">
                    <button
                      type="button"
                      className="pcs-insumos-header"
                      onClick={() => toggleInsumos(i)}
                      aria-expanded={expandedInsumos.has(i)}
                    >
                      <span className="pcs-insumos-heading">
                        Insumos precargados
                        <span className="pcs-insumos-count">{p.insumos.length}</span>
                      </span>
                      <LuChevronDown className={`icon pcs-insumos-chevron${expandedInsumos.has(i) ? '' : ' collapsed'}`} aria-hidden="true" />
                    </button>
                    {expandedInsumos.has(i) && (
                      <div className="pcs-insumos-body">
                        <div className="ncw-insumos-table-wrap">
                          <table className="ncw-insumos-table">
                            <thead>
                              <tr><th>Id. Servicio</th><th>Insumo</th><th>Cantidad</th></tr>
                            </thead>
                            <tbody>
                              {p.insumos.map((ins) => (
                                <tr key={ins.codigo}>
                                  <td className="cell-muted">{ins.codigo}</td>
                                  <td className="cell-primary">{ins.nombre}</td>
                                  <td className="cell-muted">{ins.cantidad}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="button" variant="outline" icon={LuPlus} onClick={() => setModalAbierto(true)}>
        Agregar procedimiento
      </Button>

      {modalAbierto && (
        <AgregarProcedimientoModal
          patient={patient}
          onAdd={handleAdd}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
