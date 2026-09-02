export default function ViewToggle({ view, onChange, options }) {
  return (
    <div className="segmented-control">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={`segmented-btn${view === value ? ' active' : ''}`}
          aria-pressed={view === value}
          onClick={() => onChange(value)}
        >
          <Icon className="icon" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
