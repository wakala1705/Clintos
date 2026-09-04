import './UnderConstruction.css';

export default function UnderConstruction({ icon: Icon, title, subtitle }) {
  return (
    <div className="under-construction">
      <div className="under-construction-icon"><Icon className="icon" aria-hidden="true" /></div>
      <h2 className="under-construction-title">{title}</h2>
      {subtitle && <p className="under-construction-subtitle">{subtitle}</p>}
    </div>
  );
}
