'use client';

import { useEffect, useState } from 'react';
import './ProcedimientosStep.css';
import Button from '@/Components/Button/Button';
import ProcedimientoCard from '../ProcedimientoCard/ProcedimientoCard';
import CatalogoMedicosModal from '../../CatalogoMedicosModal/CatalogoMedicosModal';
import { soloNombre, capitalizar } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { ROLES_PERSONAL } from '@/hooks/ProgramacionSalaCirugias/personalCirugia';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  LuChevronDown, LuPlus, LuX,
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
export default function ProcedimientosStep({
  datos, onChange,
}) {
  const [rolAbierto, setRolAbierto] = useState(null);
  const [quitado, setQuitado] = useState(null);
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

  // Quitar guarda lo quitado para poder deshacerlo (aviso en línea, 8 s).
  function handleRemovePersonal(index) {
    setQuitado({ item: personal[index], index });
    onChange('personal', personal.filter((_, i) => i !== index));
  }

  function handleDeshacer() {
    if (!quitado) return;
    const next = [...personal];
    next.splice(Math.min(quitado.index, next.length), 0, quitado.item);
    onChange('personal', next);
    setQuitado(null);
  }

  // El aviso de "Quitaste…" se retira solo.
  useEffect(() => {
    if (!quitado) return undefined;
    const t = window.setTimeout(() => setQuitado(null), 8000);
    return () => window.clearTimeout(t);
  }, [quitado]);

  function toggleInsumos(index) {
    setExpandedInsumos((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

  return (
    <div className="pcs-step">
      <h4 className="ncw-section-title">{procedimientos.length === 1 ? 'Procedimiento' : 'Procedimientos'}</h4>

      {procedimientos.length === 0 ? (
        <div className="ncw-step-empty">Esta cirugía no tiene procedimientos asociados.</div>
      ) : (
        <div className="pcs-list">
            {procedimientos.map((p, i) => (
              <ProcedimientoCard key={i} nombre={soloNombre(p.idCirugia)} tipo={capitalizar(p.tipoCirugia)}>
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
              </ProcedimientoCard>
            ))}
        </div>
      )}

      <h4 className="ncw-section-title">Personal que participa</h4>

      {/* Una fila por rol (siempre visibles): con personas, sus nombres + "Agregar otro";
          sin nadie, el botón de agregar en la propia fila. Cirujano y anestesiólogo son
          obligatorios para continuar. */}
      <ul className="pcs-roles">
        {ROLES_PERSONAL.map(({ rol, obligatorio }) => {
          const delRol = personal
            .map((per, index) => ({ per, index }))
            .filter(({ per }) => per.rol === rol);
          const falta = obligatorio && delRol.length === 0;
          return (
            <li className={`pcs-rol${falta ? ' pcs-rol-falta' : ''}`} key={rol}>
              <div className="pcs-rol-label">
                <span className="pcs-card-label">{rol}</span>
                <span className={`pcs-rol-req${falta ? ' pcs-rol-req-falta' : ''}`}>{obligatorio ? 'Requerido' : 'Opcional'}</span>
              </div>
              <div className="pcs-rol-contenido">
                {delRol.length > 0 && (
                  <ul className="pcs-rol-personas">
                    {delRol.map(({ per, index }) => (
                      <li className="pcs-persona" key={per.nombre}>
                        <span className="pcs-personal-nombre">{capitalizarNombre(per.nombre)}</span>
                        <button
                          type="button"
                          className="ncw-icon-btn pcs-quitar"
                          onClick={() => handleRemovePersonal(index)}
                          aria-label={`Quitar ${rol} ${capitalizarNombre(per.nombre)}`}
                          title="Quitar"
                        >
                          <LuX className="icon" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {delRol.length === 0 ? (
                  <Button type="button" variant="outline" size="sm" icon={LuPlus} onClick={() => setRolAbierto(rol)}>
                    Agregar {rol.toLowerCase()}
                  </Button>
                ) : (
                  <button type="button" className="pcs-agregar-otro" onClick={() => setRolAbierto(rol)}>
                    <LuPlus className="icon" aria-hidden="true" />
                    Agregar otro {rol.toLowerCase()}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {quitado && (
        <p className="pcs-deshacer" role="status">
          <span>Quitaste a {capitalizarNombre(quitado.item.nombre)} ({quitado.item.rol}).</span>
          <button type="button" className="pcs-deshacer-btn" onClick={handleDeshacer}>Deshacer</button>
        </p>
      )}

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
