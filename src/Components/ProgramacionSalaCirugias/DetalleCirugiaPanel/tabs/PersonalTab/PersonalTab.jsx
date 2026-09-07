'use client';

import './PersonalTab.css';

export default function PersonalTab({ cirugia }) {
  return (
    <table className="pst-table">
      <thead>
        <tr><th>Nombre</th><th>Rol</th></tr>
      </thead>
      <tbody>
        {cirugia.personal.map((p) => (
          <tr key={p.rol}>
            <td className="cell-primary">{p.nombre}</td>
            <td className="cell-muted">{p.rol}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
