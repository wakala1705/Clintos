import { useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import './PasoProcedimientos.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import CatalogoCupsModal from '../CatalogoCupsModal/CatalogoCupsModal';
import { COBERTURA_LABEL, TONO_COBERTURA } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';

const tiempoLabel = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};
const TIEMPOS = Array.from({ length: 8 }, (_, i) => {
  const min = (i + 1) * 30;
  return { value: String(min), label: tiempoLabel(min) };
});

// Paso 3: procedimientos CUPS, elegidos desde el catálogo (ventana). Por cada
// uno: tiempo estimado, fecha tentativa y, junto
// al nombre, la cobertura del contrato. La fecha que se elige se copia a los
// procedimientos que aún no tienen una (cada uno sigue siendo editable).
export default function PasoProcedimientos({
  procedimientos, onAgregar, onCambiar, onQuitar, desde,
}) {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);

  function handleFecha(p, fecha) {
    onCambiar(p.id, { fecha });
    procedimientos.forEach((otro) => {
      if (otro.id !== p.id && !otro.fecha) onCambiar(otro.id, { fecha });
    });
  }

  const agregar = (
    <Button variant="outline" icon={LuPlus} onClick={() => setCatalogoAbierto(true)}>Agregar procedimientos</Button>
  );

  return (
    <div className="pr-wrap gc-form">
      <div className="pr-encabezado">
        <div>
          <h2 className="gc-card-titulo">Procedimientos CUPS</h2>
          <p className="gc-card-sub">
            Agrega los procedimientos de la orden. La cobertura se valida contra el contrato del paciente.
            {procedimientos.length > 1 && ' La fecha que elijas se copia a los procedimientos que aún no tienen una.'}
          </p>
        </div>
        {procedimientos.length > 0 && agregar}
      </div>

      {procedimientos.length === 0 && (
        <div className="pr-vacio">
          <p>Aún no agregas procedimientos.</p>
          {agregar}
        </div>
      )}

      {procedimientos.map((p, i) => (
        <section key={p.id} className="pr-card" aria-label={`Procedimiento ${i + 1}: ${p.nombre}`}>
          <header className="pr-card-head">
            <div className="pr-titulo">
              <h3 className="pr-nombre">{p.nombre}</h3>
              <p className="pr-meta">{p.cups}</p>
            </div>
            <EstadoChip tone={TONO_COBERTURA[p.cobertura]}>{COBERTURA_LABEL[p.cobertura]}</EstadoChip>
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
                onChange={(fecha) => handleFecha(p, fecha)}
                min={desde}
                required
                ariaLabel={`Fecha tentativa de ${p.nombre}`}
                triggerClassName="pr-fecha"
              />
            </div>
          </div>
        </section>
      ))}

      {catalogoAbierto && (
        <CatalogoCupsModal
          agregados={procedimientos.map((p) => p.id)}
          onAgregar={(elegidos) => elegidos.forEach(onAgregar)}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </div>
  );
}
