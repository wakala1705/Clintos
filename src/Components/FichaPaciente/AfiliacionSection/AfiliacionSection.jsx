'use client';

import { useState } from 'react';
import './AfiliacionSection.css';
import FieldList from '@/Components/FichaPaciente/FieldList/FieldList';
import { LuChevronDown } from 'react-icons/lu';

// La afiliación es historizada (ver mockPatientDetail.js): "actual" son los
// campos de siempre, pero cada cambio de EPS/estado queda como un período
// propio con su vigencia — no se sobrescribe el anterior.
export default function AfiliacionSection({ actual, anteriores }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FieldList
        columns={4}
        fields={[
          { label: 'EPS / Asegurador', value: actual.eps },
          { label: 'Tipo de afiliado', value: actual.tipoAfiliado },
          { label: 'Estado', value: actual.estado },
          { label: 'Vigente desde', value: actual.fechaInicio },
        ]}
      />

      {anteriores.length > 0 && (
        <div className="fp-afiliacion-historial">
          <button
            type="button"
            className="fp-afiliacion-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <LuChevronDown className={`icon ${open ? 'fp-rot' : ''}`} />
            Ver afiliaciones anteriores ({anteriores.length})
          </button>

          {open && (
            <div className="fp-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>EPS / Asegurador</th>
                    <th>Tipo de afiliado</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {anteriores.map((periodo, i) => (
                    <tr key={i}>
                      <td>{periodo.eps}</td>
                      <td>{periodo.tipoAfiliado}</td>
                      <td>{periodo.estado}</td>
                      <td>{periodo.fechaInicio}</td>
                      <td>{periodo.fechaFin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
