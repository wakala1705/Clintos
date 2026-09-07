'use client';

// Input numérico libre + <datalist> de atajos (ver DURACIONES_CIRUGIA_CATALOGO
// en mockCirugiaData.js) -- reemplaza el FormSelect que tenían estos 4 campos
// (duracionEstimada en NuevaCirugiaWizard/NuevaUrgenciaModal,
// duracionPostquirurgica/duracionRecuperacion en NuevaCirugiaWizard, encargo
// explícito: "acortar las opciones" + "que el campo también sea editable").
// El datalist es nativo del navegador y su popup de sugerencias no se puede
// re-estilizar (mismo límite documentado en AGENTS.md para `<select>`), pero
// acá es aceptable porque, a diferencia de un `<select>`, el `<input>` de
// abajo sigue siendo texto libre normal: hereda el resaltado ámbar
// "obligatorio y vacío" que ya trae `.form-field input:required:placeholder-shown`
// en shared.css (mismo criterio que "Días cama" en InformacionGeneralStep.jsx)
// -- el datalist es solo un atajo opcional de autocompletado, no reemplaza al
// input como sí lo hacía el `<select>` nativo que reemplaza FormSelect.
export default function DuracionInput({
  id, value, onChange, options, required = false, placeholder = 'Ej. 60',
}) {
  const listId = `${id}-opciones`;
  return (
    <>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="1"
        step="5"
        required={required}
        placeholder={placeholder}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((min) => <option key={min} value={min} />)}
      </datalist>
    </>
  );
}
