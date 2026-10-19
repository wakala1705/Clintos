'use client';

import { useState } from 'react';
import './CopiarADias.css';
import Button from '@/Components/Button/Button';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import { DIAS_SEMANA, DIAS_SEMANA_CORTO } from '@/hooks/AgendaCirujanos/horario';

const LUN_VIE = [0, 1, 2, 3, 4];

// Panel "Copiar el horario del <día> a:" — elige los días de destino (chips) y
// aplica. El horario del día de origen se copia tal cual y activa los destinos.
export default function CopiarADias({ origen, onAplicar, onCancelar }) {
  const [destinos, setDestinos] = useState([]);

  function alternar(indice) {
    setDestinos((previos) => (
      previos.includes(indice) ? previos.filter((d) => d !== indice) : [...previos, indice]));
  }

  return (
    <div className="ac-copiar">
      <p>Copiar el horario del {DIAS_SEMANA[origen].toLowerCase()} a:</p>
      <div className="chip-group" role="group" aria-label="Días de destino">
        {DIAS_SEMANA_CORTO.map((nombre, i) => (
          i === origen ? null : (
            <ChipFilter
              key={nombre}
              active={destinos.includes(i)}
              aria-pressed={destinos.includes(i)}
              onClick={() => alternar(i)}
            >
              {nombre}
            </ChipFilter>
          )
        ))}
      </div>
      <div className="ac-copiar-acciones">
        <Button variant="outline" size="sm" onClick={() => setDestinos(LUN_VIE.filter((d) => d !== origen))}>
          Lun–Vie
        </Button>
        <Button size="sm" disabled={destinos.length === 0} onClick={() => onAplicar(destinos)}>
          Aplicar copia
        </Button>
        <Button variant="outline" size="sm" onClick={onCancelar}>Cancelar</Button>
      </div>
    </div>
  );
}
