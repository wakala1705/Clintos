'use client';

import styles from './ChipFilter.module.css';
import { LuX } from 'react-icons/lu';

// Chip de filtro (opción de un filtro rápido, segmento de un segmented
// control o filtro activo removible). Ver AGENTS.md "Chips de filtro".
// `count` se muestra como "(n)" tras el texto; `removable` agrega la X al
// final (el click de todo el chip es el que quita el filtro). El resto de
// props (role, aria-selected/aria-pressed, data-*, onClick...) pasan
// directo al <button>.
export default function ChipFilter({
  active = false,
  variant = 'default',
  size = 'base',
  count,
  removable = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    styles.chip,
    variant === 'segmented' ? styles.segmented : '',
    size === 'sm' ? styles.sm : '',
    active ? styles.active : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
      {count !== undefined && <span className={styles.count}>({count})</span>}
      {removable && <LuX className={styles.remove} aria-hidden="true" />}
    </button>
  );
}
