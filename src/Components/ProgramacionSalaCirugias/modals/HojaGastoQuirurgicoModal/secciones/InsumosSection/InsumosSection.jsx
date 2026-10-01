import { LuPackage } from 'react-icons/lu';
import './InsumosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import Badge from '@/Components/Badge/Badge';
import { SOLICITUD_FARMACIA_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  actualizarFila, devueltoInsumo, nuevoId, quitarFila,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Los insumos que vienen de la canasta no se renombran ni cambian su cantidad
// entregada (eso lo fijó farmacia): solo se concilia lo usado. Los agregados
// a mano (`manual`) sí son totalmente editables.
const esManual = (r) => r.manual;
// Sin entrega de farmacia no hay nada que conciliar: el usado no se edita.
const pendienteEntrega = (r) => !r.manual && n0(r.entregado) === 0;
const n0 = (v) => Number(v) || 0;

// Mismos tonos que el detalle de la cirugía (InsumosTab).
const ESTADO_TONE = {
  'sin-solicitar': 'warn',
  solicitado: 'success',
  entregado: 'info',
  'devuelto-parcial': 'neutral',
  devuelto: 'neutral',
};

const COLUMNS = [
  {
    key: 'nombre',
    label: 'Insumo',
    placeholder: 'Insumo',
    editable: esManual,
    render: (r) => (
      <>
        {r.nombre}
        {pendienteEntrega(r) && <span className="hgq-insumo-nota">Pendiente de entrega en Canastas</span>}
      </>
    ),
  },
  {
    key: 'estadoFarmacia',
    label: 'Farmacia',
    type: 'calc',
    render: (r) => (r.estadoFarmacia
      ? <Badge tone={ESTADO_TONE[r.estadoFarmacia] ?? 'neutral'}>{SOLICITUD_FARMACIA_LABEL[r.estadoFarmacia] ?? r.estadoFarmacia}</Badge>
      : '—'),
  },
  { key: 'entregado', label: 'Entregado', type: 'stepper', align: 'right', editable: esManual },
  {
    key: 'usado',
    label: 'Usado',
    type: 'stepper',
    align: 'right',
    editable: (r) => !pendienteEntrega(r),
    render: (r) => (pendienteEntrega(r) ? '—' : (r.usado ?? '—')),
  },
  { key: 'devuelto', label: 'Devuelto', type: 'calc', align: 'right', render: (r) => devueltoInsumo(r) },
];

export default function InsumosSection({ rows, onChange, readOnly }) {
  return (
    <SeccionHoja flush id="hgq-insumos" icon={LuPackage} titulo="Insumos y materiales">
      <HojaTabla
        ariaLabel="Insumos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        minWidth={640}
        emptyLabel="La canasta no tiene insumos. Agrega los que se usaron."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('ins'), nombre: '', entregado: 0, usado: 1, manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar insumo no contemplado"
      />
    </SeccionHoja>
  );
}
