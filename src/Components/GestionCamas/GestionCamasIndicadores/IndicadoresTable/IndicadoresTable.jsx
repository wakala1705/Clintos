'use client';

import { useMemo, useState } from 'react';
import './IndicadoresTable.css';
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from 'react-icons/lu';

// Tabla detallada "Indicadores por servicio"/"por sede" (encargo, secciones
// 9-10) — MISMA tabla completa (Ocupación/Disponibilidad/Rotación/T.
// limpieza/Fuera de servicio) sin importar qué tab de arriba esté activo
// (encargo sección 5: "estructura común de análisis", no 6 tablas
// distintas) — lo que cambia por tab son los gráficos de arriba, no esta
// comparativa. Orden de columnas (encargo: "permitir ordenar columnas"):
// estado local simple asc/desc, sin persistir entre tabs.
export default function IndicadoresTable({ titulo, columns, rows }) {
  const [sort, setSort] = useState({ key: null, dir: 'desc' });

  const filasOrdenadas = useMemo(() => {
    if (!sort.key) return rows;
    const copia = [...rows];
    copia.sort((a, b) => {
      const diff = a[sort.key] - b[sort.key];
      return sort.dir === 'asc' ? diff : -diff;
    });
    return copia;
  }, [rows, sort]);

  function handleSort(key) {
    setSort((prev) => (
      prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
    ));
  }

  return (
    <div className="card cbin-table-card">
      <div className="cbin-card-head"><h2>{titulo}</h2></div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{columns[0].label}</th>
              {columns.slice(1).map((col) => (
                <th key={col.key}>
                  <button type="button" className="cbin-th-sort" onClick={() => handleSort(col.key)}>
                    {col.label}
                    {sort.key === col.key
                      ? (sort.dir === 'desc' ? <LuArrowDown className="icon" /> : <LuArrowUp className="icon" />)
                      : <LuArrowUpDown className="icon cbin-th-sort-idle" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filasOrdenadas.map((row) => (
              <tr key={row.label}>
                <td className="cell-primary">{row.label}</td>
                {columns.slice(1).map((col) => (
                  <td key={col.key} className="cell-muted">{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
