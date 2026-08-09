import './FieldList.css';

// Grilla label/valor reutilizada por las secciones de solo-lectura de la
// ficha (Datos básicos, Ubicación, Clasificación socioeconómica...) — evita
// repetir el mismo <dl> de 2-3 columnas en cada sección.
export default function FieldList({ fields, columns = 3 }) {
  return (
    <dl className="fp-field-list" style={{ '--fp-cols': columns }}>
      {fields.map((f) => (
        <div className="fp-field-item" key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value || f.value === 0 ? f.value : '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
