'use client';

import { useState } from 'react';
import './AgregarEnfermeraModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch, LuUserRoundPlus } from 'react-icons/lu';

// "Agregar enfermera a programación" (encargo sección 2) — selecciona una
// enfermera EXISTENTE para incorporarla a la configuración de turnos, nunca
// crea un registro de persona nuevo. `disponibles` es el pool de personal
// que aún no está en la tabla principal (ver ENFERMERAS_DISPONIBLES en
// mockEnfermerasData.js); cada "Agregar" saca esa fila del pool de inmediato
// (onAgregar la mueve a la tabla principal desde Enfermeras.jsx) sin cerrar
// el modal, para poder incorporar varias en la misma sesión — se cierra con
// la X del header, mismo criterio que el resto de modales del módulo.
export default function AgregarEnfermeraModal({ disponibles, onAgregar, onClose }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtradas = q ? disponibles.filter((e) => e.nombre.toLowerCase().includes(q)) : disponibles;

  return (
    <div className="modal-overlay open">
      <div className="modal-card ae-modal-card" role="dialog" aria-modal="true" aria-labelledby="agregar-enfermera-title">
        <ModalHeader
          icon={LuUserRoundPlus}
          tone="primary"
          title="Agregar enfermera a programación"
          titleId="agregar-enfermera-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="search-field">
            <LuSearch className="icon" />
            <input
              type="text"
              placeholder="Buscar enfermera..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar enfermera"
              autoFocus
            />
          </div>

          <div className="data-table-wrap ae-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enfermera</th>
                  <th>Cargo</th>
                  <th>Área</th>
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={4} className="ct-empty-cell">No se encontraron enfermeras con estos filtros.</td></tr>
                ) : filtradas.map((e) => (
                  <tr key={e.id}>
                    <td className="cell-primary">{e.nombre}</td>
                    <td className="cell-muted">{e.cargo}</td>
                    <td>{e.areaLabel}</td>
                    <td className="col-acciones">
                      <Button variant="outline" size="sm" onClick={() => onAgregar(e)}>
                        Agregar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
