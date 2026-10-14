'use client';

// STUB: se reemplaza por el editor completo en la Tarea 6.
export default function EditorAgenda({ idMedico, onVolver }) {
  return (
    <div className="ac-card ac-estado">
      <p className="ac-estado-titulo">Editor de la agenda {idMedico}</p>
      <button type="button" onClick={onVolver}>Volver al listado</button>
    </div>
  );
}
