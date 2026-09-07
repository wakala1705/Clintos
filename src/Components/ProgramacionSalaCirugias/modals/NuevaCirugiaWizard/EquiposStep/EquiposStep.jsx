'use client';

import { useState } from 'react';
import './EquiposStep.css';
import Badge from '@/Components/Badge/Badge';
import CatalogoEquiposModal from '../../CatalogoEquiposModal/CatalogoEquiposModal';
import { LuPlus, LuTrash2 } from 'react-icons/lu';

// Paso 4 del wizard "Nueva cirugía" -- lista los equipos agregados vía
// CatalogoEquiposModal (`datos.equipos`, ver datosIniciales en
// NuevaCirugiaWizard.jsx), mismo shape {nombre,tipo,identificacion,estado}
// que ya consume @/Components/EquiposTable en el detalle de la cirugía.
// Todo equipo agregado acá arranca en estado 'disponible' -- sin edición de
// estado inline (a diferencia de la cantidad en InsumosStep, no fue pedido
// para este paso), solo agregar/quitar filas.
export default function EquiposStep({ datos, onChange }) {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const equipos = datos.equipos;

  function handleAgregar(equipo) {
    if (equipos.some((e) => e.identificacion === equipo.identificacion)) return;
    onChange('equipos', [...equipos, { ...equipo, estado: 'disponible' }]);
  }

  function handleQuitar(identificacion) {
    onChange('equipos', equipos.filter((e) => e.identificacion !== identificacion));
  }

  return (
    <div className="eqs-step">
      <div className="eqs-header">
        <h4 className="ncw-section-title">Equipos</h4>
        <button
          type="button"
          className="ncw-icon-btn"
          onClick={() => setCatalogoAbierto(true)}
          aria-label="Agregar equipo"
          title="Agregar equipo"
        >
          <LuPlus className="icon" />
        </button>
      </div>

      {equipos.length === 0 ? (
        <div className="ncw-step-empty">Aún no se han agregado equipos.</div>
      ) : (
        <div className="ncw-insumos-table-wrap">
          <table className="ncw-insumos-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Identificación</th>
                <th>Estado</th>
                <th className="ncw-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((e) => (
                <tr key={e.identificacion}>
                  <td className="cell-primary">{e.nombre}</td>
                  <td className="cell-muted">{e.tipo}</td>
                  <td className="cell-muted">{e.identificacion}</td>
                  <td><Badge tone="success">Disponible</Badge></td>
                  <td>
                    <div className="ncw-insumos-actions">
                      <button
                        type="button"
                        className="ncw-icon-btn ncw-icon-btn-danger"
                        onClick={() => handleQuitar(e.identificacion)}
                        aria-label={`Quitar ${e.nombre}`}
                        title="Quitar equipo"
                      >
                        <LuTrash2 className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {catalogoAbierto && (
        <CatalogoEquiposModal
          onSelect={handleAgregar}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </div>
  );
}
