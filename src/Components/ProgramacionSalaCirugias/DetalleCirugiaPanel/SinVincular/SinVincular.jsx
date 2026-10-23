import './SinVincular.css';

// Estado vacío de una tab del detalle de la cirugía que aún no tiene nada
// vinculado (canasta, personal o equipos): ícono, título, texto y la acción
// principal para vincularlo (`children`, un <Button>). Lo comparten Insumos,
// Personal clínico y Equipos para que se vean y se comporten igual.
export default function SinVincular({ icon: Icon, title, text, children }) {
  return (
    <div className="sv-tab">
      <div className="sv-vacio">
        <span className="sv-icon" aria-hidden="true"><Icon className="icon" /></span>
        <p className="sv-title">{title}</p>
        <p className="sv-text">{text}</p>
        {children}
      </div>
    </div>
  );
}
