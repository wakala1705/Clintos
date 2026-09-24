'use client';

import { useState } from 'react';
import './NuevaOrdenForm.css';
import CategoriaRail from './CategoriaRail/CategoriaRail';
import ItemFormPanel from './ItemFormPanel/ItemFormPanel';
import OrdenBuilderTabla from './OrdenBuilderTabla/OrdenBuilderTabla';
import Button from '@/Components/Button/Button';
import { SECCIONES_ORDEN } from '../shared/ordenSecciones';

// Pantalla de "Iniciar nueva orden" (reemplaza la lista+preview de
// OrdenesMedicasTab mientras está activa, ver `creandoOrden` ahí). Riel de
// categorías a la izquierda (CategoriaRail) + formulario "agregar ítem"
// (ItemFormPanel, remonta por categoría vía `key`) + tabla de la orden en
// construcción a la derecha (OrdenBuilderTabla). El estado de los ítems ya
// agregados (`ordenItems`, uno por categoría) vive acá porque tanto
// ItemFormPanel (agrega) como OrdenBuilderTabla (quita) lo necesitan.
export default function NuevaOrdenForm({ onCancelar, onGuardar }) {
  const [categoriaActiva, setCategoriaActiva] = useState('medicamentos');
  const [ordenItems, setOrdenItems] = useState({});
  // Receta del Recetario por voz a precargar en ItemFormPanel. `id` entra en
  // el `key` del panel para forzar el remontaje aunque ya esté en
  // Medicamentos (el prefill solo siembra estado inicial).
  const [prefill, setPrefill] = useState(null);

  const categoria = SECCIONES_ORDEN.find((s) => s.clave === categoriaActiva);

  function handleAgregarItem(item) {
    setOrdenItems((prev) => ({
      ...prev,
      [categoriaActiva]: [...(prev[categoriaActiva] ?? []), item],
    }));
  }

  function handleQuitarItem(clave, itemId) {
    setOrdenItems((prev) => ({
      ...prev,
      [clave]: prev[clave].filter((i) => i.id !== itemId),
    }));
  }

  function handleSeleccionarCategoria(clave) {
    setPrefill(null);
    setCategoriaActiva(clave);
  }

  // La receta dictada siempre es un medicamento: cambia a esa categoría y
  // precarga el formulario con lo interpretado.
  function handleRecetaVoz(receta) {
    setCategoriaActiva('medicamentos');
    setPrefill({ id: Date.now(), receta });
    window.ncToast?.('Receta cargada en el formulario. Revísela y agréguela a la orden.');
  }

  function handleGuardar() {
    const totalItems = Object.values(ordenItems).reduce((acc, arr) => acc + arr.length, 0);
    if (totalItems === 0) {
      window.ncToast?.('Agrega al menos un ítem para guardar la orden.');
      return;
    }
    onGuardar(ordenItems);
  }

  return (
    <div className="nof-layout">
      <div className="nof-sidebar">
        <CategoriaRail categorias={SECCIONES_ORDEN} activa={categoriaActiva} onSelect={handleSeleccionarCategoria} />
        <ItemFormPanel
          key={`${categoriaActiva}-${prefill?.id ?? 0}`}
          categoria={categoria}
          onAgregar={handleAgregarItem}
          prefill={prefill?.receta ?? null}
          onRecetaVoz={handleRecetaVoz}
        />
      </div>

      <div className="nof-main">
        <OrdenBuilderTabla ordenItems={ordenItems} secciones={SECCIONES_ORDEN} onQuitar={handleQuitarItem} />

        <div className="nof-footer">
          <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
