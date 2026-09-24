'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './AllModulesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PillTabs from '@/Components/Home/PillTabs/PillTabs';
import { LuLayoutGrid, LuLock, LuSearch } from 'react-icons/lu';

// Mismos 4 valores que MODULE_OPTIONS de Home.jsx — duplicado acá (no
// importado desde ahí) para no crear un import circular Home.jsx ->
// AllModulesModal.jsx -> Home.jsx; mismo criterio que ya usa
// FiltroPickerModal.jsx para su helper `normalizar` (ver ese archivo).
const MODULE_TABS = [
  { value: 'asistencial', label: 'Asistencial' },
  { value: 'contable', label: 'Contable' },
  { value: 'nomina', label: 'Nómina' },
];

// Mismo tono por módulo que MODULE_TONES en Home.jsx — duplicado acá por el
// mismo motivo que MODULE_TABS arriba (evitar el import circular).
const MODULE_TONES = {
  asistencial: 'blue',
  contable: 'green',
  nomina: 'orange',
};

// Quita tildes para que la búsqueda encuentre "facturacion" al escribir
// "facturación" o viceversa — mismo helper que FiltroPickerModal.jsx.
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Buscador global de submódulos (ver AGENTS.md/Home.jsx): a diferencia de
// las 3 pills del hero (que solo cambian qué grupo se ve en el home), este
// modal existe porque el catálogo de módulos/submódulos va a seguir
// creciendo y las pills solas dejan de alcanzar para navegar rápido.
// Independiente del estado de esas pills: cambiar de tab acá adentro sin
// clickear un ítem no altera qué pill queda activa en el Home al cerrar.
export default function AllModulesModal({ groups, initialModule, onClose }) {
  const [activeTab, setActiveTab] = useState(initialModule ?? 'asistencial');
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Agrupado por sección (Consulta Externa, Hospitalización...): el nombre de
  // la sección va una sola vez como label del grupo, no repetido en cada card.
  // Si la búsqueda coincide con el nombre de la sección, se muestran todos
  // sus ítems.
  const q = normalizar(query.trim());
  const filteredGroups = groups
    .filter((group) => group.module === activeTab)
    .map((group) => ({
      ...group,
      items: !q || normalizar(group.title).includes(q)
        ? group.items
        : group.items.filter((item) => normalizar(item.title).includes(q)),
    }))
    .filter((group) => group.items.length > 0);

  const tone = MODULE_TONES[activeTab];

  return (
    <div className="amm-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="amm-modal">
        <ModalHeader
          icon={LuLayoutGrid}
          title="Todos los módulos"
          titleId="all-modules-modal-title"
          onClose={onClose}
          autoFocusClose
        />

        <div className="amm-toolbar">
          <PillTabs options={MODULE_TABS} value={activeTab} onChange={setActiveTab} ariaLabel="Módulo" />

          <div className="amm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar módulo o submódulo..."
              aria-label="Buscar módulo o submódulo"
            />
          </div>
        </div>

        <div className="amm-list">
          {filteredGroups.length === 0 && (
            <p className="amm-empty">
              {query ? <>Sin resultados para &quot;{query}&quot;.</> : 'Todavía no hay submódulos disponibles acá.'}
            </p>
          )}
          {filteredGroups.map((group) => (
            <section key={group.title} className="amm-group">
              <h4 className="amm-group-title">
                <group.icon className="icon" aria-hidden="true" />
                {group.title}
                <span className="amm-group-count">{group.items.length}</span>
              </h4>
              <div className="amm-grid">
                {group.items.map((item) => {
                  const content = (
                    <>
                      <div className={`amm-item-icon${tone !== 'blue' ? ` tone-${tone}` : ''}`}><item.icon className="icon" /></div>
                      <div className="amm-item-body">
                        <div className="amm-item-title-row">
                          <span className="amm-item-title">{item.title}</span>
                          {!item.enabled && (
                            <span className="module-card-badge"><LuLock className="icon" />Próximamente</span>
                          )}
                        </div>
                        <p className="amm-item-desc">{item.description}</p>
                      </div>
                    </>
                  );
                  if (!item.enabled) {
                    return (
                      <div key={item.title} className="amm-item disabled" aria-disabled="true">
                        {content}
                      </div>
                    );
                  }
                  return (
                    <Link key={item.title} href={item.href} className="amm-item" onClick={onClose}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
