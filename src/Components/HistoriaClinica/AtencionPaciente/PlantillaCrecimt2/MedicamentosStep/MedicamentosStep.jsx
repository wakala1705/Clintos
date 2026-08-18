'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './MedicamentosStep.css';
import MedicamentoCard, { ESTADO_OPCIONES_ALBENDAZOL, ESTADO_OPCIONES_COMPLETO } from './MedicamentoCard/MedicamentoCard';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuInfo } from 'react-icons/lu';

function initialMedicamentos() {
  return {
    sulfatoFerroso: { estado: '', fecha: '', dosis: '' },
    vitaminaA: { estado: '', fecha: '', dosis: '' },
    albendazol: { estado: '', fecha: '', otros: '' },
  };
}

// Paso 11 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — antes
// "Diagnóstico" (placeholder inerte sin fuente legacy verificada, ver
// AGENTS.md/comentario de arriba de este archivo), reemplazado por
// "Medicamentos": prescripción de los 3 medicamentos del esquema pediátrico
// estándar (Sulfato Ferroso, Vitamina A, Albendazol), cada uno como su
// propia tarjeta (ver MedicamentoCard.jsx) para que la relación
// medicamento → estado de suministro → fecha de prescripción → dosis se lea
// de un vistazo, sin una única card grande envolviendo los 3 (encargo
// explícito: "tarjetas o contenedores sutiles para separar los tres
// medicamentos"). El nombre de cada medicamento es fijo por tarjeta (no un
// select, ver capturas de referencia del legacy) — lo que sí se elige por
// select es el estado de suministro ("¿Se suministra?", ver
// ESTADO_OPCIONES_COMPLETO/ESTADO_OPCIONES_ALBENDAZOL en
// MedicamentoCard.jsx). Una sola subsección real, sin scrollspy propio —
// igual que RiesgoStep/FactoresRiesgoStep, expone `scrollToSub` como
// no-op. Se mantiene SIEMPRE montado (el padre lo oculta con `hidden`) para
// no perder lo ya diligenciado al ir y volver entre pasos.
const MedicamentosStep = forwardRef(function MedicamentosStep({ hidden }, ref) {
  const [medicamentos, setMedicamentos] = useState(initialMedicamentos);
  const [infoOpen, setInfoOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  // Escape cierra el modal de información — mismo patrón que el modal
  // "Expandir esquema" de VacunacionStep.jsx (sin focus trap: acá tampoco
  // hay un flujo de Cancelar/Elegir que romper si Tab se escapa).
  useEffect(() => {
    if (!infoOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setInfoOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [infoOpen]);

  function updateMedicamento(key, patch) {
    setMedicamentos((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Medicamentos</h1>
      <p className="pf-section-desc">Registra la prescripción de medicamentos del esquema pediátrico estándar.</p>

      <MedicamentoCard
        nombre="Sulfato Ferroso"
        estado={medicamentos.sulfatoFerroso.estado}
        onEstadoChange={(v) => updateMedicamento('sulfatoFerroso', { estado: v })}
        opcionesEstado={ESTADO_OPCIONES_COMPLETO}
        fecha={medicamentos.sulfatoFerroso.fecha}
        onFechaChange={(v) => updateMedicamento('sulfatoFerroso', { fecha: v })}
        campoExtraLabel="Dosis"
        campoExtraValue={medicamentos.sulfatoFerroso.dosis}
        onCampoExtraChange={(v) => updateMedicamento('sulfatoFerroso', { dosis: v })}
        campoExtraPlaceholder="Ej. 3 mg/kg/día vía oral cada 24 horas"
      />

      <MedicamentoCard
        nombre="Vitamina A"
        estado={medicamentos.vitaminaA.estado}
        onEstadoChange={(v) => updateMedicamento('vitaminaA', { estado: v })}
        opcionesEstado={ESTADO_OPCIONES_COMPLETO}
        fecha={medicamentos.vitaminaA.fecha}
        onFechaChange={(v) => updateMedicamento('vitaminaA', { fecha: v })}
        campoExtraLabel="Dosis"
        campoExtraValue={medicamentos.vitaminaA.dosis}
        onCampoExtraChange={(v) => updateMedicamento('vitaminaA', { dosis: v })}
        campoExtraPlaceholder="Ej. 100.000 UI dosis única vía oral"
      />

      <MedicamentoCard
        nombre="Albendazol"
        estado={medicamentos.albendazol.estado}
        onEstadoChange={(v) => updateMedicamento('albendazol', { estado: v })}
        opcionesEstado={ESTADO_OPCIONES_ALBENDAZOL}
        fecha={medicamentos.albendazol.fecha}
        onFechaChange={(v) => updateMedicamento('albendazol', { fecha: v })}
        campoExtraLabel="Otros"
        campoExtraValue={medicamentos.albendazol.otros}
        onCampoExtraChange={(v) => updateMedicamento('albendazol', { otros: v })}
        campoExtraPlaceholder="Información adicional relacionada con la prescripción"
        campoExtraWide
      />

      <button type="button" className="btn btn-secondary med-info-btn" onClick={() => setInfoOpen(true)}>
        <LuInfo className="icon" aria-hidden="true" />
        Información de Prescripción de Medicamentos
      </button>

      {infoOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setInfoOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="med-info-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              title="Información de prescripción de medicamentos"
              titleId="med-info-title"
              onClose={() => setInfoOpen(false)}
              closeLabel="Cerrar información de prescripción"
              autoFocusClose
            />
            <div className="modal-body">
              <p className="med-info-text">
                Verifica siempre las guías institucionales de dosificación pediátrica vigentes y las
                indicaciones específicas de cada medicamento — peso, edad, vía y frecuencia — antes de
                confirmar la prescripción.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MedicamentosStep;
