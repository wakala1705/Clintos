import { LuMonitorCog } from 'react-icons/lu';
import './EquiposSalaSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, formatoCOP, nuevoId, quitarFila, valorDerechosSala, valorPorTiempo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Equipo' },
  { key: 'identificacion', label: 'Identificación' },
  { key: 'minutos', label: 'Minutos de uso', type: 'number', align: 'right' },
  { key: 'tarifaHora', label: 'Tarifa por hora', type: 'number', align: 'right' },
  { key: 'valor', label: 'Valor', type: 'calc', align: 'right', render: (r) => formatoCOP(valorPorTiempo(r)) },
];

export default function EquiposSalaSection({
  equipos, derechosSala, onChangeEquipos, onChangeDerechos, readOnly,
}) {
  const total = equipos.reduce((t, r) => t + valorPorTiempo(r), 0) + valorDerechosSala(derechosSala);
  return (
    <SeccionHoja id="hgq-equipos" icon={LuMonitorCog} titulo="Equipos y derechos de sala" total={total}>
      <HojaTabla
        ariaLabel="Equipos"
        columns={COLUMNS}
        rows={equipos}
        readOnly={readOnly}
        emptyLabel="Sin equipos registrados."
        onChangeRow={(id, campo, valor) => onChangeEquipos(actualizarFila(equipos, id, campo, valor))}
        onAddRow={() => onChangeEquipos([...equipos, {
          id: nuevoId('eq'), nombre: '', identificacion: '', minutos: 0, tarifaHora: 80000,
        }])}
        onRemoveRow={(id) => onChangeEquipos(quitarFila(equipos, id))}
        addLabel="Agregar equipo"
      />
      <div className="hgq-grid hgq-derechos">
        <div>
          <label htmlFor="hgq-sala-min" className="hgq-field-label">Derechos de sala: minutos</label>
          <input id="hgq-sala-min" type="number" min={0} className="hgq-input hgq-input-num" disabled={readOnly}
            value={derechosSala?.minutos ?? ''}
            onChange={(e) => onChangeDerechos({ ...derechosSala, minutos: e.target.value === '' ? '' : Number(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="hgq-sala-tarifa" className="hgq-field-label">Tarifa por hora</label>
          <input id="hgq-sala-tarifa" type="number" min={0} className="hgq-input hgq-input-num" disabled={readOnly}
            value={derechosSala?.tarifaHora ?? ''}
            onChange={(e) => onChangeDerechos({ ...derechosSala, tarifaHora: e.target.value === '' ? '' : Number(e.target.value) })} />
        </div>
        <div>
          <div className="hgq-field-label">Valor derechos de sala (bloques de 30 min)</div>
          <div className="hgq-derechos-valor">{formatoCOP(valorDerechosSala(derechosSala))}</div>
        </div>
      </div>
    </SeccionHoja>
  );
}
