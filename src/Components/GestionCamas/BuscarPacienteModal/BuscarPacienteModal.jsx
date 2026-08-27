'use client';

import { useMemo, useState } from 'react';
import './BuscarPacienteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { ADMISIONES } from '@/hooks/Admisiones/mockAdmisionesData';
import { LuCheck, LuSearch, LuUsers } from 'react-icons/lu';

// Mismo cálculo que BedDetailModal.jsx (GestionCamas y GestionEnfermeria/
// PanelGeneral/BedBoardModal, feature hermana, mismo criterio de no
// compartir helpers chicos entre features de AGENTS.md) — primeras 2
// iniciales, sin acentos especiales ni normalización adicional.
function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// Buscador de "Asignar paciente" (ver AsignarPacienteModal.jsx) — a
// propósito NO es el buscador global de afiliados (.ps-overlay de
// NuevaCitaFlow.jsx, usado por Asignación de citas/Programar cita/
// Admisiones/Pre-ingreso): una cama se asigna a alguien que ya pasó por el
// proceso de Admisiones y sigue "Admitido" (piso), no a cualquier afiliado
// registrado en la clínica — de ahí que filtre ADMISIONES en vez de la
// lista de afiliados, y que sus columnas sean las de una admisión (N°
// admisión/Administradora/Tipo de admisión) en vez de EPS/ciudad/estado de
// cobertura. Es un componente propio (no legacy-imperativo): la selección
// vive en estado de React (`selectedId`) y se resuelve con un solo
// `onSelect(admision)` al padre, sin pasar por window.*.
export default function BuscarPacienteModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const admitidos = useMemo(() => ADMISIONES.filter((a) => a.estado === 'admitido'), []);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admitidos;
    const qDigits = q.replace(/\D/g, '');
    return admitidos.filter((a) => {
      const matchNombre = a.nombreAfiliado.toLowerCase().includes(q);
      const matchDocumento = qDigits !== '' && a.documento.includes(qDigits);
      const matchAdmision = a.numeroAdmision.toLowerCase().includes(q);
      return matchNombre || matchDocumento || matchAdmision;
    });
  }, [admitidos, query]);

  function confirmar(admision) {
    if (!admision) return;
    onSelect(admision);
  }

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card bp-modal-card" role="dialog" aria-modal="true" aria-labelledby="bp-modal-title">
        <ModalHeader
          icon={LuUsers}
          title="Seleccionar paciente admitido"
          titleId="bp-modal-title"
          subtitle="Solo pacientes con admisión activa"
          onClose={onClose}
        />

        <div className="bp-search-row">
          <div className="bp-search-field">
            <LuSearch className="icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o N° de admisión..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="bp-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>N° Admisión</th>
                <th>Documento</th>
                <th>Administradora</th>
                <th>Tipo de admisión</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr className="bp-row-empty">
                  <td colSpan={5}>No se encontraron pacientes admitidos.</td>
                </tr>
              ) : filtrados.map((a) => (
                <tr
                  key={a.id}
                  className={a.id === selectedId ? 'selected' : ''}
                  tabIndex={0}
                  onClick={() => setSelectedId(a.id)}
                  onDoubleClick={() => { setSelectedId(a.id); confirmar(a); }}
                >
                  <td>
                    <div className="bp-patient-cell">
                      <PatientAvatar iniciales={iniciales(a.nombreAfiliado)} className="bp-avatar" />
                      <span className="bp-pname">{a.nombreAfiliado}</span>
                    </div>
                  </td>
                  <td>{a.numeroAdmision}</td>
                  <td>{a.documento}</td>
                  <td>{a.administradora}</td>
                  <td>{a.tipoAdmision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedId}
            onClick={() => confirmar(admitidos.find((a) => a.id === selectedId))}
          >
            <LuCheck className="icon" />
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
