'use client';

import { useRef } from 'react';
import styles from './SearchField.module.css';
import SearchFieldSelect from '@/Components/SearchFieldSelect/SearchFieldSelect';
import { LuSearch, LuX } from 'react-icons/lu';

// Buscador estándar del proyecto (ver AGENTS.md "Buscador"). `onChange`/
// `onChangeField` reciben el valor directo, no un evento. Con `fields`
// ([{ value, label }]) muestra el selector "Buscar por" antes del input.
export default function SearchField({
  value,
  onChange,
  placeholder = 'Buscar',
  ariaLabel,
  size = 'md',
  clearable = true,
  fields,
  field,
  onChangeField,
  fieldLabel = 'Buscar por',
  inputRef,
  className = '',
  ...inputProps
}) {
  const ownRef = useRef(null);
  const ref = inputRef ?? ownRef;
  const rootClass = [styles.root, size === 'sm' && styles.sm, className].filter(Boolean).join(' ');

  function handleClear() {
    onChange('');
    ref.current?.focus();
  }

  return (
    <div className={rootClass}>
      <LuSearch className={styles.icon} aria-hidden="true" />
      {fields && (
        <>
          <SearchFieldSelect options={fields} value={field} onChange={onChangeField} label={fieldLabel} />
          <span className={styles.divider} aria-hidden="true"></span>
        </>
      )}
      <input
        {...inputProps}
        ref={ref}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {clearable && value && (
        <button type="button" className={styles.clear} onClick={handleClear} aria-label="Limpiar búsqueda">
          <LuX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
