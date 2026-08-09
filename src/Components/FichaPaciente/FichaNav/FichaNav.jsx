'use client';

import { useEffect, useState } from 'react';
import './FichaNav.css';

// Tabla de contenido/anclas lateral en vez de tabs (~40 campos en total, ver
// prompt de esta pantalla) — resalta la sección visible con IntersectionObserver
// mientras el usuario hace scroll por el cuerpo.
export default function FichaNav({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="fp-nav" aria-label="Secciones de la ficha">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`fp-nav-link ${activeId === s.id ? 'active' : ''}`}
        >
          {s.icon && <s.icon className="icon" />}
          {s.label}
        </a>
      ))}
    </nav>
  );
}
