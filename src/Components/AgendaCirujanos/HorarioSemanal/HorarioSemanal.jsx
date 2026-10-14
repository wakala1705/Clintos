'use client';

import { LuTriangleAlert } from 'react-icons/lu';
import './HorarioSemanal.css';
import DatePicker from '@/Components/DatePicker/DatePicker';
import DiaHorario from '../DiaHorario/DiaHorario';
import {
  agregarBloque, alternarDia, alternarSinFecha, cambiarBloque, copiarDia,
  quitarBloque,
} from '@/hooks/AgendaCirujanos/horario';
import { errorDia, errorVigencia } from '@/hooks/AgendaCirujanos/validaciones';

// Pestaña "Horario semanal": vigencia (desde / hasta o sin fecha de fin) y los
// 7 días con sus bloques. Controlado: cada cambio llama a `onChange` con un
// horario NUEVO (las operaciones son las funciones puras de horario.js).
export default function HorarioSemanal({
  horario, onChange, sede, onAviso,
}) {
  const errorDeVigencia = errorVigencia(horario);

  return (
    <div>
      <section className="ac-seccion" aria-labelledby="ac-vigencia-titulo">
        <h3 id="ac-vigencia-titulo" className="ac-seccion-titulo">Vigencia <span>{sede}</span></h3>
        <div className="ac-grid-2">
          <div className="form-field">
            <label htmlFor="ac-vigente-desde">Vigente desde</label>
            <DatePicker
              id="ac-vigente-desde"
              ariaLabel="Vigente desde"
              value={horario.desde}
              invalid={!horario.desde}
              onChange={(iso) => onChange({ ...horario, desde: iso })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ac-vigente-hasta">Hasta</label>
            <DatePicker
              id="ac-vigente-hasta"
              ariaLabel="Vigente hasta"
              value={horario.hasta ?? ''}
              min={horario.desde || undefined}
              disabled={horario.hasta === null}
              invalid={horario.hasta === ''}
              onChange={(iso) => onChange({ ...horario, hasta: iso })}
            />
          </div>
        </div>
        <label className="ac-check">
          <input
            type="checkbox"
            checked={horario.hasta === null}
            onChange={(e) => onChange(alternarSinFecha(horario, e.target.checked))}
          />
          Sin fecha de fin
        </label>
        {errorDeVigencia ? (
          <p className="ac-err" role="alert">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            {errorDeVigencia}
          </p>
        ) : (
          <p className="ac-hint">Fuera de este rango, el cirujano no tiene agenda.</p>
        )}
      </section>

      <section aria-labelledby="ac-dias-titulo">
        <h3 id="ac-dias-titulo" className="ac-seccion-titulo">Días y horarios</h3>
        {horario.dias.map((dia, i) => (
          <DiaHorario
            // El índice ES la identidad del día (lunes…domingo): la lista nunca se reordena.
            key={i}
            indice={i}
            dia={dia}
            error={errorDia(dia)}
            onToggle={(activo) => onChange(alternarDia(horario, i, activo))}
            onBloque={(posicion, campo, valor) => onChange(cambiarBloque(horario, i, posicion, campo, valor))}
            onAgregarBloque={() => onChange(agregarBloque(horario, i))}
            onQuitarBloque={(posicion) => onChange(quitarBloque(horario, i, posicion))}
            onCopiar={(destinos) => {
              onChange(copiarDia(horario, i, destinos));
              onAviso?.('Horario copiado');
            }}
          />
        ))}
      </section>
    </div>
  );
}
