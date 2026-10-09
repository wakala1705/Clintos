'use client';

import { useState } from 'react';
import './ProcedimientosStep.css';
import Button from '@/Components/Button/Button';
import CatalogoMedicosModal from '../../CatalogoMedicosModal/CatalogoMedicosModal';
import { soloNombre, capitalizar } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuChevronDown, LuPlus, LuScissors, LuX,
} from 'react-icons/lu';

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
// Roles de personal que se pueden sumar a la cirugía (además del cirujano/
// anestesiólogo de cada procedimiento). `catalogo` es el `descripcion` de
// MEDICOS_CATALOGO que filtra CatalogoMedicosModal -- Ayudante sale de los
// cirujanos.
const ROLES_PERSONAL = [
  { rol: 'Cirujano', catalogo: 'Cirujano' },
  { rol: 'Anestesiólogo', catalogo: 'Anestesiólogo' },
  { rol: 'Ayudante', catalogo: 'Cirujano' },
  { rol: 'Instrumentadora', catalogo: 'Instrumentadora' },
  { rol: 'Circulante', catalogo: 'Circulante' },
];

export default function ProcedimientosStep({
  datos, onChange,
}) {
  const [rolAbierto, setRolAbierto] = useState(null);
  // Índices (dentro de `procedimientos`) cuya card de insumos está expandida
  // -- arranca vacío (todas colapsadas, progressive disclosure).
  const [expandedInsumos, setExpandedInsumos] = useState(() => new Set());
  const procedimientos = datos.procedimientos;
  const personal = datos.personal ?? [];

  function handleAddPersonal(rol, valor) {
    const nombre = soloNombre(valor);
    if (personal.some((p) => p.rol === rol && p.nombre === nombre)) return;
    onChange('personal', [...personal, { rol, nombre }]);
  }

  function handleRemovePersonal(index) {
    onChange('personal', personal.filter((_, i) => i !== index));
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
        <div className="ncw-step-empty">Esta cirugía no tiene procedimientos asociados.</div>
      ) : (
        <div className="pcs-table">
          <div className="pcs-list">
            {procedimientos.map((p, i) => (
              <div className="pcs-card" key={i}>
                <div className="pcs-card-top">
                  <div className="pcs-card-heading">
                    <span className="pcs-cell-icon" aria-hidden="true"><LuScissors className="icon" /></span>
                    <div className="pcs-card-heading-text">
                      <span className="pcs-cell-primary">{soloNombre(p.idCirugia)}</span>
                      <span className="pcs-card-tipo">{capitalizar(p.tipoCirugia)}</span>
                    </div>
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

      <h4 className="ncw-section-title">Personal que participa</h4>

      {personal.length > 0 && (
        <ul className="pcs-personal-list">
          {personal.map((per, i) => (
            <li className="pcs-personal-item" key={`${per.rol}:${per.nombre}`}>
              <span className="pcs-card-label">{per.rol}</span>
              <span className="pcs-personal-nombre">{per.nombre}</span>
              <button
                type="button"
                className="ncw-icon-btn ncw-icon-btn-danger"
                onClick={() => handleRemovePersonal(i)}
                aria-label={`Quitar ${per.rol} ${per.nombre}`}
                title="Quitar"
              >
                <LuX className="icon" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pcs-personal-actions">
        {ROLES_PERSONAL.map(({ rol }) => (
          <Button key={rol} type="button" variant="outline" size="sm" icon={LuPlus} onClick={() => setRolAbierto(rol)}>
            Agregar {rol.toLowerCase()}
          </Button>
        ))}
      </div>

      {rolAbierto && (
        <CatalogoMedicosModal
          tipo={ROLES_PERSONAL.find((r) => r.rol === rolAbierto).catalogo}
          onSelect={(valor) => handleAddPersonal(rolAbierto, valor)}
          onClose={() => setRolAbierto(null)}
        />
      )}

    </div>
  );
}
