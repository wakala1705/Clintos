'use client';

import { LuPlus, LuTrash2, LuTriangleAlert } from 'react-icons/lu';
import './MaterialesTabla.css';
import Button from '@/Components/Button/Button';
import {
  calcularDevuelto, excedeEntregado, materialManual, materialesConExceso, totales,
} from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

const dos = (n) => String(n).padStart(2, '0');

export default function MaterialesTabla({ materiales, onChange }) {
  const set = (id, campo, valor) => onChange(materiales.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)));
  const quitar = (id) => onChange(materiales.filter((m) => m.id !== id));
  const nExceso = materialesConExceso(materiales).length;
  const tot = totales(materiales);

  return (
    <section className="hco-section" aria-labelledby="hco-mat-titulo">
      <div className="hco-section-head">
        <h4 id="hco-mat-titulo" className="hco-kicker">Materiales del paquete</h4>
        <Button variant="secondary" size="sm" icon={LuPlus} onClick={() => onChange([...materiales, materialManual()])}>
          Agregar material
        </Button>
      </div>

      <div className="hco-mat-card">
        <table className="hco-mat-tabla">
          <thead>
            <tr>
              <th>Material</th>
              <th className="hco-num">Entregado (und.)</th>
              <th className="hco-num">Consumido</th>
              <th className="hco-num">Devuelto</th>
              <th className="hco-col-accion"><span className="hco-sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => {
              const exceso = excedeEntregado(m);
              const devuelto = calcularDevuelto(m);
              const nombre = m.nombre || 'material nuevo';
              return (
                <tr key={m.id} className={exceso ? 'is-error' : undefined}>
                  <td>
                    {m.manual ? (
                      <input
                        className="hco-input"
                        type="text"
                        value={m.nombre}
                        placeholder="Nombre del material"
                        aria-label="Nombre del material"
                        onChange={(e) => set(m.id, 'nombre', e.target.value)}
                      />
                    ) : (
                      <span className="hco-mat-nombre">
                        {m.nombre}
                        {m.receta && (
                          <span className="hco-receta">
                            <LuTriangleAlert className="icon" aria-hidden="true" />
                            Regularizar con receta
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="hco-num">
                    {m.manual ? (
                      <input
                        className="hco-input hco-input-num"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={m.entregado}
                        aria-label={`Entregado de ${nombre}`}
                        onChange={(e) => set(m.id, 'entregado', e.target.value)}
                      />
                    ) : (
                      <span className="hco-valor">{dos(m.entregado)}</span>
                    )}
                  </td>
                  <td className="hco-num">
                    <input
                      className="hco-input hco-input-num"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={m.consumido}
                      aria-label={`Consumido de ${nombre}`}
                      aria-invalid={exceso || undefined}
                      onChange={(e) => set(m.id, 'consumido', e.target.value)}
                    />
                  </td>
                  <td className="hco-num"><span className="hco-valor">{devuelto === null ? '—' : dos(devuelto)}</span></td>
                  <td className="hco-col-accion">
                    {m.manual && (
                      <button type="button" className="hco-quitar" aria-label={`Quitar ${nombre}`} onClick={() => quitar(m.id)}>
                        <LuTrash2 className="icon" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total · {tot.items} {tot.items === 1 ? 'ítem' : 'ítems'}</td>
              <td className="hco-num">{tot.entregado}</td>
              <td className="hco-num">{tot.consumido}</td>
              <td className="hco-num">{tot.devuelto}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {nExceso > 0 && (
        <div className="hco-aviso-error" role="alert">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          <span>
            {nExceso === 1 ? '1 material supera' : `${nExceso} materiales superan`} la cantidad entregada.
            {' '}Corrige el consumo para registrar la hoja.
          </span>
        </div>
      )}
    </section>
  );
}
