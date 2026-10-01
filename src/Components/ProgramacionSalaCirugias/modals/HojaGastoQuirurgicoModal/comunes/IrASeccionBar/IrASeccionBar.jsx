'use client';

import FormSelect from '@/Components/FormSelect/FormSelect';
import './IrASeccionBar.css';

// Barra compacta de tablet: reemplaza la tira horizontal del índice.
// `value` siempre "" para que el placeholder se mantenga tras elegir.
export default function IrASeccionBar({ options, onIr }) {
  return (
    <div className="hgq-irbar">
      <FormSelect
        id="hgq-ir-seccion"
        value=""
        onChange={onIr}
        options={options}
        placeholder="Ir a sección…"
        ariaLabel="Ir a sección"
      />
    </div>
  );
}
