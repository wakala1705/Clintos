'use client';

import { useState } from 'react';
import './BuscarPacienteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { PATIENTS, calcularEdad } from '@/hooks/ListaPacientes/mockPatientsData';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoMedicosModal.jsx/
// CatalogoDiagnosticosModal.jsx (no compartido entre modales, ver AGENTS.md
// "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Buscador de paciente para acceder al Historial Quirúrgico desde
// Programación de Sala de Cirugías (encargo explícito) -- no existe un
// buscador de paciente genérico en el proyecto (ver AGENTS.md "Component
// organization"), así que este vive junto a los demás catálogos de esta
// feature. Mismo look que CatalogoMedicosModal (buscador + tabla + fila
// seleccionable) pero sin paginación -- 46 registros de PATIENTS caben con
// scroll interno de la lista, mismo criterio que BuscarPacienteModal de
// Gestión de Camas.
export default function BuscarPacienteModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  const qTrim = query.trim();
  const qNorm = normalizar(qTrim);
  const filtered = PATIENTS.filter((p) => (
    !qNorm || normalizar(p.nombre).includes(qNorm) || p.documento.includes(qTrim)
  ));

  function handleConfirm() {
    if (!seleccion) return;
    onSelect(seleccion);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card bpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="bpm-title">
        <ModalHeader
          title="Buscar paciente"
          titleId="bpm-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de paciente"
        />
        <div className="modal-body bpm-body">
          <div className="bpm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o documento"
              aria-label="Buscar por nombre o documento"
            />
          </div>

          <div className="bpm-table">
            <div className="bpm-row bpm-row-head">
              <span>Nombre</span>
              <span>Documento</span>
              <span>Edad</span>
              <span>EPS</span>
            </div>
            <div className="bpm-list" role="listbox" aria-labelledby="bpm-title">
              {filtered.length === 0 && (
                <div className="bpm-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((p) => {
                const active = seleccion?.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    role="option"
                    aria-selected={active}
                    className={`bpm-row bpm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(p)}
                  >
                    <span className="bpm-nombre">{p.nombre}</span>
                    <span className="bpm-documento">{p.tipoDocumento} {p.documento}</span>
                    <span className="bpm-edad">{calcularEdad(p.fechaNacimiento)} años</span>
                    <span className="bpm-eps">{p.eps}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
