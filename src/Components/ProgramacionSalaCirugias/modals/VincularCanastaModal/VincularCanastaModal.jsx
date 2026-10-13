'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './VincularCanastaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { CANASTAS_GENERICAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { procedimientosCoincidentes } from '@/hooks/ProgramacionSalaCirugias/canastasProcedimientos';
import { LuPackage } from 'react-icons/lu';

const SIN_SUGERIDOS = [];

// Insignia por complejidad: verde / ámbar / violeta (el rojo de `danger` era demasiado alarmante
// para una complejidad alta; el violeta es el tono extra de la feature, ver .cnc-badge-violet).
const COMPLEJIDAD_BADGE = {
  Baja: { tone: 'success' },
  Media: { tone: 'warn' },
  Alta: { tone: 'neutral', className: 'cnc-badge-violet vcm-badge-alta' },
};

// Opciones de una complejidad: la canasta genérica (sin procedimiento
// específico) y una canasta propia por cada procedimiento oncológico de esa
// complejidad (ver PROCEDIMIENTOS_CANASTA en canastasProcedimientos.js).
function opcionesDe(generica) {
  return [
    {
      id: generica.id,
      titulo: 'Canasta genérica',
      detalle: 'Sin procedimiento específico',
      nombre: generica.nombre,
      items: generica.items,
    },
    ...generica.procedimientos.map((p) => ({
      id: p.id,
      titulo: p.nombre,
      detalle: p.especialidad,
      nombre: `Canasta · ${p.nombre}`,
      items: p.items,
    })),
  ];
}

// "Vincular canastas" (Paso 3 del wizard "Nueva cirugía" y tab Insumos del
// detalle): se elige primero la complejidad (3 tarjetas: baja / media / alta),
// luego el procedimiento oncológico -- cada uno con su propia canasta -- y se
// ven sus insumos antes de confirmar. `onSelect` recibe una copia `{ id,
// nombre, items }`: la cirugía queda con sus propios insumos, editables, sin
// alterar la canasta de catálogo. Una cirugía lleva una sola canasta (aunque
// tenga varios procedimientos): vincular otra reemplaza la actual
// (`canastaActualId`, solo para marcarla).
// `complejidadSugerida` y `procedimientosSugeridos` (nombres de los
// procedimientos de la cirugía) abren el modal ya posicionado: la complejidad
// de la cirugía y, si el procedimiento coincide con uno del catálogo, su
// canasta preseleccionada.
export default function VincularCanastaModal({
  canastaActualId = null, complejidadSugerida = null, procedimientosSugeridos = SIN_SUGERIDOS, onSelect, onClose,
}) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const opcionesPorComplejidad = useMemo(
    () => Object.fromEntries(CANASTAS_GENERICAS.map((g) => [g.complejidad, opcionesDe(g)])),
    [],
  );
  const sugeridos = useMemo(() => procedimientosCoincidentes(procedimientosSugeridos), [procedimientosSugeridos]);

  const complejidadDe = (id) => CANASTAS_GENERICAS.find((g) => opcionesPorComplejidad[g.complejidad].some((o) => o.id === id))?.complejidad ?? null;
  const inicialId = canastaActualId ?? sugeridos[0] ?? null;
  const [seleccionId, setSeleccionId] = useState(inicialId);
  const [complejidad, setComplejidad] = useState(() => complejidadDe(inicialId) ?? complejidadSugerida ?? null);

  const generica = CANASTAS_GENERICAS.find((g) => g.complejidad === complejidad) ?? null;
  const opciones = complejidad ? opcionesPorComplejidad[complejidad] : [];
  const seleccion = opciones.find((o) => o.id === seleccionId) ?? null;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function elegirComplejidad(c) {
    if (c === complejidad) return;
    setComplejidad(c);
    // La selección de otra complejidad no aplica: hay que elegir un procedimiento de esta.
    if (!opcionesPorComplejidad[c].some((o) => o.id === seleccionId)) setSeleccionId(null);
  }

  function handleVincular() {
    if (!seleccion) return;
    onSelect({
      id: seleccion.id,
      nombre: seleccion.nombre,
      items: seleccion.items.map((i) => ({ ...i })),
    });
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div ref={modalRef} className="modal-card vcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="vcm-title">
        <ModalHeader
          icon={LuPackage}
          tone="primary"
          title="Vincular canasta"
          titleId="vcm-title"
          onClose={onClose}
          closeLabel="Cerrar vinculación de canasta"
        />
        <div className="modal-body vcm-body">
          <div className="vcm-options" role="radiogroup" aria-label="Complejidad de la canasta">
            {CANASTAS_GENERICAS.map((c) => {
              const activa = c.complejidad === complejidad;
              return (
                <button
                  type="button"
                  key={c.id}
                  role="radio"
                  aria-checked={activa}
                  className={`vcm-option${activa ? ' active' : ''}`}
                  onClick={() => elegirComplejidad(c.complejidad)}
                >
                  <span className="vcm-option-top">
                    <Badge {...COMPLEJIDAD_BADGE[c.complejidad]}>{`Complejidad ${c.complejidad.toLowerCase()}`}</Badge>
                  </span>
                  <span className="vcm-option-nombre">{c.nombre}</span>
                  <span className="vcm-option-count">{`${c.procedimientos.length} procedimientos`}</span>
                </button>
              );
            })}
          </div>

          {generica ? (
            <>
              <p className="vcm-hint">{generica.descripcion}</p>
              <div className="vcm-detalle">
                <div className="vcm-procs">
                  <div className="vcm-procs-head">Procedimiento</div>
                  <div className="vcm-procs-lista" role="radiogroup" aria-label={`Procedimientos de complejidad ${complejidad.toLowerCase()}`}>
                  {opciones.map((o) => {
                    const activa = o.id === seleccionId;
                    return (
                      <button
                        type="button"
                        key={o.id}
                        role="radio"
                        aria-checked={activa}
                        className={`vcm-proc${activa ? ' active' : ''}`}
                        onClick={() => setSeleccionId(o.id)}
                      >
                        <span className="vcm-proc-texto">
                          <span className="vcm-proc-nombre">{o.titulo}</span>
                          <span className="vcm-proc-detalle">{o.detalle}</span>
                        </span>
                        {sugeridos.includes(o.id) && <Badge tone="info">Sugerida</Badge>}
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div className="vcm-preview">
                  {seleccion ? (
                    <>
                      <div className="vcm-table-wrap">
                        <table className="vcm-table">
                          <thead>
                            <tr><th>{`Insumos de la canasta (${seleccion.items.length})`}</th><th className="vcm-num">Cantidad</th></tr>
                          </thead>
                          <tbody>
                            {seleccion.items.map((i) => (
                              <tr key={i.codigo}>
                                <td>{i.nombre}</td>
                                <td className="vcm-muted vcm-num">{i.cantidad}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="vcm-empty">Selecciona un procedimiento para ver su canasta.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="vcm-empty">Elige una complejidad para ver sus procedimientos.</div>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleVincular} disabled={!seleccion}>Vincular canasta</Button>
        </div>
      </div>
    </div>
  );
}
