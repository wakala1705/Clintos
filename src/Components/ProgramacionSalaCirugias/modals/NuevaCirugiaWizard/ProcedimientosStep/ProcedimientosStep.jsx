'use client';

import { useState } from 'react';
import './ProcedimientosStep.css';
import Button from '@/Components/Button/Button';
import AgregarProcedimientoModal from './AgregarProcedimientoModal/AgregarProcedimientoModal';
import { LuPlus, LuTrash2 } from 'react-icons/lu';

// idCirugia/idCirujano/idAnestesiologo llegan como "id - nombre" (ver
// onSelect en CatalogoProcedimientosModal.jsx/CatalogoMedicosModal.jsx) --
// acá solo interesa el nombre, el id es metadato del catálogo de origen, no
// algo que el usuario de este paso necesite ver (encargo explícito para
// Cirujano/Anestesiólogo, aplicado también al nombre del procedimiento por
// el mismo criterio).
function soloNombre(valor) {
  const i = valor.indexOf(' - ');
  return i === -1 ? valor : valor.slice(i + 3);
}

// Tipo cirugía llega en mayúsculas del catálogo (mismo formato que
// idCirugia/idCirujano/idAnestesiologo) -- capitalizado (solo la primera
// letra) en vez de minúscula pareja, encargo explícito.
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Paso 2 del wizard "Nueva cirugía" -- lista los procedimientos agregados
// vía AgregarProcedimientoModal (`datos.procedimientos`, ver datosIniciales
// en NuevaCirugiaWizard.jsx) más el botón que abre ese modal. Sin
// paginación/búsqueda (a diferencia de InformacionGeneralStep no hay
// catálogo acá, es la lista propia de la cirugía que se está armando) --
// se espera un puñado de filas por cirugía, no un listado largo. Cada
// procedimiento es un bloque de 2 filas (encargo explícito) en vez de una
// fila de tabla con 4 columnas: arriba el nombre del procedimiento con el
// tipo de cirugía debajo (capitalizado, ver capitalizar() arriba -- llega en
// mayúsculas del catálogo, encargo explícito, como una
// etiqueta descriptiva del nombre y no un dato de formulario aparte), abajo
// Médico/Anestesiólogo en 2 columnas separadas (antes un solo bloque
// "Personal" con ambos nombres apilados).
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
                    className="pcs-remove-btn"
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
