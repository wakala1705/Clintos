'use client';

import { useState } from 'react';
import {
  LuCopy, LuPlus, LuTrash2, LuTriangleAlert,
} from 'react-icons/lu';
import './DiaHorario.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ToggleSwitch from '@/Components/ToggleSwitch/ToggleSwitch';
import CopiarADias from '../CopiarADias/CopiarADias';
import {
  DIAS_SEMANA, FIN_JORNADA, INICIO_JORNADA, opcionesHora,
} from '@/hooks/AgendaCirujanos/horario';
import { resumenDia } from '@/hooks/AgendaCirujanos/formato';

// Hora de inicio hasta 18:30 y de fin desde 07:30: el bloque mínimo es de 30 min
// y nada sale de la jornada operativa.
const OPCIONES_INICIO = opcionesHora(INICIO_JORNADA, FIN_JORNADA - 30);
const OPCIONES_FIN = opcionesHora(INICIO_JORNADA + 30, FIN_JORNADA);

// Un día de la semana: interruptor, resumen, bloques (inicio–fin cada 30 min),
// "Agregar bloque" y "Copiar a otros días". Presentacional: todo cambio sube por
// callbacks; solo recuerda si el panel de copia está abierto.
export default function DiaHorario({
  indice, dia, error, onToggle, onBloque, onAgregarBloque, onQuitarBloque, onCopiar,
}) {
  const [copiando, setCopiando] = useState(false);
  const nombre = DIAS_SEMANA[indice];

  return (
    <div className={`ac-dia${dia.activo ? '' : ' off'}`}>
      <div className="ac-dia-cab">
        <ToggleSwitch
          label={nombre}
          checked={dia.activo}
          onChange={(activo) => {
            onToggle(activo);
            if (!activo) setCopiando(false);
          }}
        />
        <span className="ac-dia-resumen">{dia.activo ? resumenDia(dia) : 'No disponible'}</span>
      </div>

      {dia.activo && (
        <>
          <div className="ac-bloques">
            {dia.bloques.map((bloque, j) => (
              <div className="ac-bloque" key={j}>
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-inicio-${indice}-${j}`}
                    ariaLabel={`Inicio del bloque ${j + 1}, ${nombre}`}
                    value={bloque.inicio}
                    onChange={(v) => onBloque(j, 'inicio', v)}
                    options={OPCIONES_INICIO}
                  />
                </div>
                <span className="ac-bloque-sep">a</span>
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-fin-${indice}-${j}`}
                    ariaLabel={`Fin del bloque ${j + 1}, ${nombre}`}
                    value={bloque.fin}
                    onChange={(v) => onBloque(j, 'fin', v)}
                    options={OPCIONES_FIN}
                  />
                </div>
                <button
                  type="button"
                  className="ncw-icon-btn ncw-icon-btn-danger"
                  aria-label={`Quitar bloque ${j + 1}, ${nombre}`}
                  onClick={() => onQuitarBloque(j)}
                >
                  <LuTrash2 className="icon" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="ac-dia-acciones">
            <Button variant="outline" size="sm" icon={LuPlus} onClick={onAgregarBloque}>
              Agregar bloque
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={LuCopy}
              aria-expanded={copiando}
              onClick={() => setCopiando((abierto) => !abierto)}
            >
              Copiar a otros días
            </Button>
          </div>

          {copiando && (
            <CopiarADias
              origen={indice}
              onAplicar={(destinos) => { onCopiar(destinos); setCopiando(false); }}
              onCancelar={() => setCopiando(false)}
            />
          )}
        </>
      )}

      {error && (
        <p className="ac-err" role="alert">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
