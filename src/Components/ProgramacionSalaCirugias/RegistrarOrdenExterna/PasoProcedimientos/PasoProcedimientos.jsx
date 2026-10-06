import { useRef, useState } from 'react';
import { LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import './PasoProcedimientos.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import { CATALOGO_CUPS, COBERTURA_LABEL, TONO_COBERTURA } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';
import { LATERALIDAD_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { duracionLabel } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

const TIEMPOS = Array.from({ length: 8 }, (_, i) => {
  const min = (i + 1) * 30;
  return { value: String(min), label: duracionLabel(min / 30) };
});

const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Paso 3: procedimientos CUPS. Por cada uno: especialidad, lateralidad,
// tiempo estimado, fecha tentativa e indicador de cobertura del contrato.
export default function PasoProcedimientos({
  procedimientos, onAgregar, onCambiar, onQuitar, desde,
}) {
  const [busqueda, setBusqueda] = useState('');
  const buscadorRef = useRef(null);
  const q = norm(busqueda.trim());
  const usados = new Set(procedimientos.map((p) => p.id));
  const resultados = q
    ? CATALOGO_CUPS.filter((c) => !usados.has(c.id) && norm(`${c.cups} ${c.nombre} ${c.especialidad}`).includes(q))
    : [];

  function elegir(c) {
    onAgregar(c);
    setBusqueda('');
  }

  return (
    <div className="pr-wrap gc-form">
      <div>
        <h2 className="gc-card-titulo">Procedimientos CUPS</h2>
        <p className="gc-card-sub">Agrega los procedimientos de la orden. La cobertura se valida contra el contrato del paciente.</p>
      </div>

      <div className="form-field">
        <label htmlFor="ro-cups">Buscar por código o nombre</label>
        <div className="search-field pr-buscador">
          <LuSearch className="icon" aria-hidden="true" />
          <input
            id="ro-cups"
            ref={buscadorRef}
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej. colecistectomía"
            autoComplete="off"
          />
        </div>
        {q && (
          <ul className="pr-resultados" aria-label="Resultados de la búsqueda">
            {resultados.length === 0 && <li className="pr-sin">Sin resultados para “{busqueda}”.</li>}
            {resultados.map((c) => (
              <li key={c.id}>
                <button type="button" className="pr-opcion" onClick={() => elegir(c)}>
                  <span className="pr-opcion-nombre">{c.nombre}</span>
                  <span className="pr-opcion-meta">{c.cups} · {c.especialidad}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {procedimientos.length === 0 && (
        <p className="pr-vacio">Aún no agregas procedimientos. Busca uno arriba para continuar.</p>
      )}

      {procedimientos.map((p, i) => (
        <section key={p.id} className="pr-card" aria-label={`Procedimiento ${i + 1}: ${p.nombre}`}>
          <header className="pr-card-head">
            <div>
              <h3 className="pr-nombre">{p.nombre}</h3>
              <p className="pr-meta">{p.cups} · {p.especialidad}</p>
            </div>
            <button
              type="button"
              className="pr-quitar"
              aria-label={`Quitar ${p.nombre}`}
              onClick={() => onQuitar(p.id)}
            >
              <LuTrash2 className="icon" aria-hidden="true" />
            </button>
          </header>

          <div className="pr-campos">
            <fieldset className="pr-lateralidad">
              <legend className="gc-label">Lateralidad</legend>
              <div className="pr-segmentos">
                {Object.entries(LATERALIDAD_LABEL).map(([valor, label]) => (
                  <label key={valor} className={`pr-seg${p.lateralidad === valor ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name={`lat-${p.id}`}
                      checked={p.lateralidad === valor}
                      onChange={() => onCambiar(p.id, { lateralidad: valor })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-field">
              <label htmlFor={`ro-tiempo-${p.id}`}>Tiempo estimado</label>
              <FormSelect
                id={`ro-tiempo-${p.id}`}
                value={String(p.tiempo)}
                onChange={(v) => onCambiar(p.id, { tiempo: Number(v) })}
                options={TIEMPOS}
              />
            </div>

            <div className="form-field">
              <label htmlFor={`ro-fecha-${p.id}`}>Fecha tentativa <span className="gc-req" aria-hidden="true">*</span></label>
              <DatePicker
                id={`ro-fecha-${p.id}`}
                value={p.fecha}
                onChange={(fecha) => onCambiar(p.id, { fecha })}
                min={desde}
                ariaLabel={`Fecha tentativa de ${p.nombre}`}
                triggerClassName="pr-fecha"
              />
            </div>

            <div className="pr-cobertura">
              <span className="gc-label">Cobertura del contrato</span>
              <EstadoChip tone={TONO_COBERTURA[p.cobertura]}>{COBERTURA_LABEL[p.cobertura]}</EstadoChip>
            </div>
          </div>
        </section>
      ))}

      {procedimientos.length > 0 && (
        <button type="button" className="gc-link pr-agregar" onClick={() => buscadorRef.current?.focus()}>
          <LuPlus className="icon" aria-hidden="true" />
          Agregar otro procedimiento
        </button>
      )}
    </div>
  );
}
