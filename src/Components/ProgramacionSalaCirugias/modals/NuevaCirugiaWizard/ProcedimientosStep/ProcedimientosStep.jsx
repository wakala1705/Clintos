'use client';

import { useState } from 'react';
import './ProcedimientosStep.css';
import Button from '@/Components/Button/Button';
import AgregarProcedimientoModal from './AgregarProcedimientoModal/AgregarProcedimientoModal';
import { LuPlus, LuTrash2 } from 'react-icons/lu';

// Paso 2 del wizard "Nueva cirugía" -- lista los procedimientos agregados
// vía AgregarProcedimientoModal (`datos.procedimientos`, ver datosIniciales
// en NuevaCirugiaWizard.jsx) más el botón que abre ese modal. Sin
// paginación/búsqueda (a diferencia de InformacionGeneralStep no hay
// catálogo acá, es la lista propia de la cirugía que se está armando) --
// se espera un puñado de filas por cirugía, no un listado largo.
export default function ProcedimientosStep({
  datos, onChange, patient,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const procedimientos = datos.procedimientos;

  function handleAdd(procedimiento) {
    onChange('procedimientos', [...procedimientos, procedimiento]);
    setModalAbierto(false);
  }

  function handleRemove(index) {
    onChange('procedimientos', procedimientos.filter((_, i) => i !== index));
  }

  return (
    <div className="pcs-step">
      <h4 className="pcs-section-title">Procedimientos asociados</h4>

      {procedimientos.length === 0 ? (
        <div className="pcs-empty">Aún no se han agregado procedimientos.</div>
      ) : (
        <div className="pcs-table">
          <div className="pcs-row pcs-row-head">
            <span>Procedimiento</span>
            <span>Tipo cirugía</span>
            <span>Cirujano</span>
            <span>Anestesiólogo</span>
            <span aria-hidden="true" />
          </div>
          <div className="pcs-list">
            {procedimientos.map((p, i) => (
              <div className="pcs-row" key={i}>
                <span className="pcs-cell-primary">{p.idCirugia}</span>
                <span>{p.tipoCirugia}</span>
                <span>{p.idCirujano}</span>
                <span>{p.idAnestesiologo}</span>
                <button
                  type="button"
                  className="pcs-remove-btn"
                  onClick={() => handleRemove(i)}
                  aria-label={`Quitar procedimiento ${p.idCirugia}`}
                  title="Quitar procedimiento"
                >
                  <LuTrash2 className="icon" />
                </button>
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
