'use client';

import './PanelConfiguracion.css';

const PESTANAS = [
  { id: 'horario', label: 'Horario semanal' },
  { id: 'excepciones', label: 'Excepciones' },
];

// Contenedor con las dos pestañas de la configuración (Horario semanal /
// Excepciones). Patrón de tabs de la feature: role="tablist" con flechas
// izquierda/derecha entre pestañas; el contenido activo llega como `children`.
export default function PanelConfiguracion({
  pestana, onPestana, cantidadExcepciones, children,
}) {
  function handleKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const actual = PESTANAS.findIndex((p) => p.id === pestana);
    const paso = e.key === 'ArrowRight' ? 1 : -1;
    const siguiente = PESTANAS[(actual + paso + PESTANAS.length) % PESTANAS.length];
    onPestana(siguiente.id);
    document.getElementById(`ac-tab-${siguiente.id}`)?.focus();
  }

  return (
    <section className="ac-card ac-config" aria-label="Configuración de la agenda">
      <div className="ac-tabs" role="tablist" aria-label="Secciones de la agenda" onKeyDown={handleKeyDown}>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`ac-tab-${p.id}`}
            className="ac-tab"
            aria-selected={pestana === p.id}
            aria-controls="ac-panel-config"
            tabIndex={pestana === p.id ? 0 : -1}
            onClick={() => onPestana(p.id)}
          >
            {p.label}
            {p.id === 'excepciones' && <span className="ac-tab-count">{cantidadExcepciones}</span>}
          </button>
        ))}
      </div>
      <div
        className="ac-config-cuerpo"
        role="tabpanel"
        id="ac-panel-config"
        aria-labelledby={`ac-tab-${pestana}`}
      >
        {children}
      </div>
    </section>
  );
}
