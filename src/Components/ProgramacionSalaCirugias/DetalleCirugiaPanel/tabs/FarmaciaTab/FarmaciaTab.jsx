'use client';

import './FarmaciaTab.css';

export default function FarmaciaTab({ cirugia }) {
  const { farmacia } = cirugia;
  return (
    <table className="ft-table">
      <thead><tr><th>Medicamento</th><th>Dosis</th></tr></thead>
      <tbody>
        {farmacia.medicamentos.map((m) => (
          <tr key={m.nombre}><td className="cell-primary">{m.nombre}</td><td className="cell-muted">{m.dosis}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
