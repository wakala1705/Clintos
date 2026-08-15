'use client';

import { useMemo, useState } from 'react';
import './PacienteStep.css';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { LuSearch, LuUserRoundSearch } from 'react-icons/lu';
import { ESQUEMA_LABEL, MOCK_PACIENTES, normalize } from '@/hooks/Vacunacion/mockVacunacionData';

function initials(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// Mismo patrón de buscador que "Nueva cita" (asignación de citas, ver
// NuevaCitaFlow.jsx: campo de búsqueda + tabla de resultados con avatar,
// documento, EPS, estado) — reimplementado acá como estado de React normal
// (esa pantalla usa un controlador imperativo legado, ver AGENTS.md, no
// importable directo en otra feature) sobre MOCK_PACIENTES, que ya trae
// documento/eps. Un clic en la fila selecciona y avanza al paso siguiente —
// no hace falta un botón "Aceptar" aparte: acá se elige UN paciente para UNA
// operación puntual, no un carrito de selección múltiple.
export default function PacienteStep({ onSelect }) {
  const [query, setQuery] = useState('');

  const resultados = useMemo(() => {
    const q = normalize(query);
    if (!q) return MOCK_PACIENTES;
    return MOCK_PACIENTES.filter((p) => normalize(p.nombre).includes(q) || normalize(p.documento).replace(/\D/g, '').includes(q.replace(/\D/g, '')) || normalize(p.documento).includes(q));
  }, [query]);

  return (
    <div className="rv-paciente-step">
      <div className="search-field rv-paciente-search">
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar paciente por nombre o documento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar paciente por nombre o documento"
          autoFocus
        />
      </div>

      {resultados.length === 0 ? (
        <div className="rv-empty-state">
          <LuUserRoundSearch className="icon" aria-hidden="true" />
          <h4>No encontramos pacientes</h4>
          <p>Verifica el nombre o número de documento e inténtalo nuevamente.</p>
        </div>
      ) : (
        <div className="rv-paciente-table-wrap">
          <table className="rv-paciente-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Edad</th>
                <th>EPS</th>
                <th>Esquema</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((p) => (
                <tr key={p.id} tabIndex={0} onClick={() => onSelect(p)} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(p); }}>
                  <td>
                    <div className="rv-paciente-cell">
                      <PatientAvatar iniciales={initials(p.nombre)} className="rv-paciente-avatar" />
                      <div className="rv-paciente-id">
                        <span className="rv-paciente-nombre">{p.nombre}</span>
                        <span className="rv-paciente-doc">{p.documento}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.edadLabel}</td>
                  <td>{p.eps}</td>
                  <td><span className={`vac-esquema-badge esquema-${p.esquema}`}>{ESQUEMA_LABEL[p.esquema]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
