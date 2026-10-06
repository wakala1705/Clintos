import './SeccionPersonal.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import { PERSONAL, ROLES_PERSONAL } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';
import { disponibilidad } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

// Estado de un integrante en la franja elegida: sin asignar / disponible /
// cruce de horario (siempre ícono + texto vía EstadoChip).
export function estadoPersonal(rol, nombre, seleccion, duracion) {
  if (!nombre) return 'sin-asignar';
  const persona = PERSONAL[rol].find((p) => p.value === nombre);
  if (!persona || !seleccion) return 'disponible';
  return disponibilidad(persona.ocupado, seleccion.inicio, duracion) === 'cruce' ? 'cruce' : 'disponible';
}

const CHIP = {
  'sin-asignar': { tone: 'pending', texto: 'Sin asignar' },
  disponible: { tone: 'complete', texto: 'Disponible' },
  cruce: { tone: 'rejected', texto: 'Cruce de horario' },
};

// El equipo quirúrgico se asigna aquí (no en la orden ni en el checklist). El
// cirujano llega precargado desde la orden.
export default function SeccionPersonal({
  personal, onChange, seleccion, duracion,
}) {
  return (
    <section className="gc-seccion gc-form" aria-labelledby="pc-personal">
      <h3 className="gc-seccion-titulo" id="pc-personal">Personal</h3>
      <div className="sper-lista">
        {ROLES_PERSONAL.map(({ key, label }) => {
          const valor = personal[key];
          const opciones = PERSONAL[key].map((p) => ({ value: p.value, label: p.value }));
          // Un cirujano externo (de la orden) no está en el catálogo local.
          if (valor && !opciones.some((o) => o.value === valor)) opciones.unshift({ value: valor, label: `${valor} (de la orden)` });
          const estado = estadoPersonal(key, valor, seleccion, duracion);
          const chip = CHIP[estado];
          return (
            <div key={key} className="sper-fila">
              <div className="form-field sper-campo">
                <label htmlFor={`pc-${key}`}>{label}</label>
                <FormSelect
                  id={`pc-${key}`}
                  value={valor}
                  onChange={(v) => onChange(key, v)}
                  options={opciones}
                  placeholder="Selecciona"
                />
              </div>
              <div className="sper-estado">
                <EstadoChip tone={chip.tone}>{chip.texto}</EstadoChip>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
