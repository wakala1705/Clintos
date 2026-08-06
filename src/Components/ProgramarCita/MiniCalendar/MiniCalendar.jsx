'use client';

import { useState } from 'react';
import './MiniCalendar.css';
import { generateMonthGrid, monthLabel } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from 'react-icons/lu';

export default function MiniCalendar() {
  const [collapsed, setCollapsed] = useState(false);
  const { dowLabels, days } = generateMonthGrid();

  return (
    <div className="pc-panel pc-mini-cal">
      <div className={`pc-mini-cal-head${collapsed ? ' collapsed' : ''}`}>
        <span className="pc-mini-cal-month">{monthLabel()}</span>
        <div className="pc-mini-cal-nav">
          <button type="button" className="pc-mini-cal-nav-btn" aria-label="Mes anterior">
            <LuChevronLeft className="icon" />
          </button>
          <button type="button" className="pc-mini-cal-nav-btn" aria-label="Mes siguiente">
            <LuChevronRight className="icon" />
          </button>
          <span className="pc-mini-cal-nav-divider"></span>
          <button
            type="button"
            className="pc-mini-cal-nav-btn"
            aria-label={collapsed ? 'Expandir calendario' : 'Colapsar calendario'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <LuChevronDown className="icon" /> : <LuChevronUp className="icon" />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="pc-mini-cal-grid">
          {dowLabels.map((d) => (
            <div className="pc-mini-cal-dow" key={d}>{d}</div>
          ))}
          {days.map((d, i) => (
            <div
              key={i}
              className={`pc-mini-cal-day${d.muted ? ' muted' : ''}${d.today ? ' today' : ''}`}
            >
              {d.n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
